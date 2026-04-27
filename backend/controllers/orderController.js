const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const VendorProfile = require("../models/VendorsProfile");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} = require("../utils/emailService");

// helper — same logic as frontend
const getDiscountedPrice = (product) => {
  const productDiscount = product.discountPercentage || 0;
  const storeDiscount = product.vendorId?.onSale
    ? product.vendorId.salePercentage || 0
    : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0)
    return { finalPrice: product.price, discount: 0 };
  const finalPrice = Math.round(
    product.price - (product.price * effectiveDiscount) / 100
  );
  return { finalPrice, discount: effectiveDiscount };
};

// ─────────────────────────────────────────────
// @desc    Place a new order from the customer's cart
// @route   POST /api/orders
// @access  Customer only
// ─────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { couponCode, discountAmount: rawDiscount } = req.body;

    const cart = await Cart.findOne({ customerId: req.user._id }).populate({
      path: "items.productId",
      populate: { path: "vendorId", select: "onSale salePercentage" },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // validate stock for each item before proceeding
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock === undefined || product.stock === null) {
        return res.status(400).json({
          message: `Product "${product.name}" does not have stock information`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Normalise discount — default to 0 if no coupon was supplied
    const discountAmount = couponCode ? rawDiscount ?? 0 : 0;

    // Compute the cart subtotal the same way frontend does: with product discounts applied
    // This ensures consistency between frontend validation and backend order calculation
    const cartSubtotal = cart.items.reduce((sum, item) => {
      const { finalPrice } = getDiscountedPrice(item.productId);
      return sum + finalPrice * item.quantity;
    }, 0);

    if (discountAmount > cartSubtotal) {
      return res.status(400).json({
        message: `Discount amount (${discountAmount}) cannot exceed the order subtotal (${cartSubtotal}).`,
      });
    }

    /**
     * Split the cart into separate orders per vendor.
     * The discount is distributed proportionally across vendor sub-orders
     * so that the sum of all vendor totals equals (subtotal - discount).
     */
    const itemsByVendor = {};
    cart.items.forEach((item) => {
      const vendorId = item.productId.vendorId._id
        ? item.productId.vendorId._id.toString()
        : item.productId.vendorId.toString();
      if (!itemsByVendor[vendorId]) itemsByVendor[vendorId] = [];
      itemsByVendor[vendorId].push(item);
    });

    const createdOrders = [];

    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      const itemsSnapshot = items.map((item) => {
        const { finalPrice, discount } = getDiscountedPrice(item.productId);
        return {
          productId: item.productId._id,
          name: item.productId.name,
          price: finalPrice, // discounted price saved
          originalPrice: item.productId.price, // original price saved for reference
          discountApplied: discount,
          quantity: item.quantity,
        };
      });

      // Calculate vendor subtotal using the same discounted prices as the frontend
      const vendorSubtotal = itemsSnapshot.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Distribute coupon discount proportionally: each vendor bears their share
      // e.g. vendor contributes 40% of discounted cart → absorbs 40% of coupon discount
      const vendorDiscount =
        cartSubtotal > 0 ? (vendorSubtotal / cartSubtotal) * discountAmount : 0;

      const vendorTotal = Math.max(0, vendorSubtotal - vendorDiscount);

      const order = await Order.create({
        customerId: req.user._id,
        vendorId,
        items: itemsSnapshot,
        totalAmount: vendorTotal,
        ...(couponCode && { couponCode, discountAmount: vendorDiscount }),
        status: "pending",
      });

      createdOrders.push(order);

      // ── Email: order confirmation (fire-and-forget, one per vendor sub-order) ──
      sendOrderConfirmation({
        customerEmail: req.user.email,
        customerName: req.user.name,
        orderId: order._id,
        items: itemsSnapshot.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: vendorTotal,
      }).catch(console.error);
    }

    // reduce stock after all orders created
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // clear cart
    cart.items = [];
    await cart.save();

    return res
      .status(201)
      .json({ message: "Orders placed", orders: createdOrders });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res
      .status(500)
      .json({ message: "Server error while placing order." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all orders for the logged-in customer
// @route   GET /api/orders/my-orders
// @access  Customer only
// ─────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate("vendorId", "storeName")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching orders." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all orders assigned to the logged-in vendor
// @route   GET /api/orders/vendor-orders
// @access  Vendor only
// ─────────────────────────────────────────────
const getVendorOrders = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    const orders = await Order.find({ vendorId: vendorProfile._id })
      .populate("customerId", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getVendorOrders error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching vendor orders." });
  }
};

// ─────────────────────────────────────────────
// @desc    Update the status of an order
// @route   PUT /api/orders/:id/status
// @access  Vendor only
// ─────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "confirmed", "delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(
          ", "
        )}.`,
      });
    }

    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.vendorId.toString() !== vendorProfile._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to update this order." });
    }

    // ─── Status Transition Validation ───────────────────────────────────
    // Once an order is "delivered", it cannot be changed to "pending" or "confirmed"
    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Cannot update status. Order is already delivered and cannot be modified.",
      });
    }

    // Once an order is "confirmed", it cannot go back to "pending"
    if (order.status === "confirmed" && status === "pending") {
      return res.status(400).json({
        message: "Cannot change status from confirmed back to pending.",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // ── Email: order status update (fire-and-forget) ──────────────────────────
    User.findById(order.customerId)
      .then((customer) => {
        if (customer) {
          sendOrderStatusUpdate({
            customerEmail: customer.email,
            customerName: customer.name,
            orderId: order._id,
            status,
            items: order.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
            totalAmount: order.totalAmount,
          }).catch(console.error);
        }
      })
      .catch(console.error);

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating order status." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Protected (customer + vendor)
// ─────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("vendorId", "storeName");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("getOrderById error:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching order." });
  }
};

// ─────────────────────────────────────────────
// @desc    Generate and stream a PDF invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Customer only (own orders)
// ─────────────────────────────────────────────
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("vendorId", "storeName")
      .populate("items.productId", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Ensure the requesting customer owns this order
    if (order.customerId._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to download this invoice." });
    }

    // ── PDF setup ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );
    doc.pipe(res);

    // ── Colour palette ───────────────────────────────────────────────────────
    const BLUE      = "#2563EB";
    const DARK      = "#1E293B";
    const MUTED     = "#64748B";
    const LIGHT_BG  = "#F1F5F9";
    const BORDER    = "#CBD5E1";
    const WHITE     = "#FFFFFF";

    const pageW     = doc.page.width;          // 595
    const margin    = 50;
    const contentW  = pageW - margin * 2;      // 495

    // ── HEADER BAND ──────────────────────────────────────────────────────────
    doc.rect(0, 0, pageW, 90).fill(BLUE);

    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("OnDemand", margin, 22);

    doc
      .fillColor("rgba(255,255,255,0.75)")
      .font("Helvetica")
      .fontSize(11)
      .text("TAX INVOICE", margin, 58);

    // Invoice number badge (top-right of banner)
    const invoiceNo = `#${order._id.toString().slice(0, 8).toUpperCase()}`;
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(invoiceNo, margin, 22, { align: "right", width: contentW });

    // ── META SECTION ─────────────────────────────────────────────────────────
    const metaTop = 110;

    // Left column — invoice details
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("INVOICE NO", margin, metaTop);
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(invoiceNo, margin, metaTop + 13);

    const formattedDate = new Date(order.createdAt).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "long", year: "numeric" }
    );
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("DATE", margin, metaTop + 35);
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(formattedDate, margin, metaTop + 48);

    // Right column — customer details
    const rightCol = margin + contentW / 2;
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("BILLED TO", rightCol, metaTop);
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(order.customerId.name, rightCol, metaTop + 13);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(order.customerId.email, rightCol, metaTop + 28);

    // Vendor line
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text("SOLD BY", rightCol, metaTop + 50);
    doc
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(order.vendorId?.storeName || "—", rightCol, metaTop + 63);

    // ── DIVIDER ──────────────────────────────────────────────────────────────
    const divider1Y = metaTop + 90;
    doc.moveTo(margin, divider1Y).lineTo(margin + contentW, divider1Y).strokeColor(BORDER).lineWidth(1).stroke();

    // ── ITEMS TABLE HEADER ───────────────────────────────────────────────────
    const tableTop    = divider1Y + 14;
    const col = {
      item:  margin,
      qty:   margin + contentW * 0.52,
      unit:  margin + contentW * 0.68,
      total: margin + contentW * 0.84,
    };

    // Header background
    doc.rect(margin, tableTop, contentW, 22).fill(LIGHT_BG);

    doc
      .fillColor(MUTED)
      .font("Helvetica-Bold")
      .fontSize(8.5);

    doc.text("ITEM",       col.item  + 6, tableTop + 7);
    doc.text("QTY",        col.qty,       tableTop + 7);
    doc.text("UNIT PRICE", col.unit,      tableTop + 7);
    doc.text("TOTAL",      col.total,     tableTop + 7);

    // ── ITEM ROWS ────────────────────────────────────────────────────────────
    let rowY = tableTop + 28;
    const rowH = 24;

    order.items.forEach((item, idx) => {
      // Alternating row tint
      if (idx % 2 === 0) {
        doc.rect(margin, rowY - 4, contentW, rowH).fill("#F8FAFC");
      }

      const unitPrice = item.price ?? item.productId?.price ?? 0;
      const lineTotal = unitPrice * item.quantity;

      doc
        .fillColor(DARK)
        .font("Helvetica")
        .fontSize(9.5);

      // Item name — truncate if very long
      const itemName = (item.name || item.productId?.name || "—").slice(0, 48);
      doc.text(itemName,                     col.item  + 6, rowY);
      doc.text(String(item.quantity),        col.qty,       rowY);
      doc.text(`Rs. ${unitPrice.toFixed(2)}`, col.unit,     rowY);
      doc.text(`Rs. ${lineTotal.toFixed(2)}`, col.total,    rowY);

      rowY += rowH;
    });

    // ── DIVIDER ──────────────────────────────────────────────────────────────
    const divider2Y = rowY + 6;
    doc.moveTo(margin, divider2Y).lineTo(margin + contentW, divider2Y).strokeColor(BORDER).lineWidth(1).stroke();

    // ── SUMMARY BLOCK ────────────────────────────────────────────────────────
    let summaryY = divider2Y + 16;
    const labelX  = margin + contentW * 0.58;
    const valueX  = margin + contentW * 0.80;
    const summaryW = contentW * 0.20;

    // Subtotal
    const subtotal = order.items.reduce(
      (sum, i) => sum + (i.price ?? 0) * i.quantity,
      0
    );

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text("Subtotal", labelX, summaryY)
      .text(`Rs. ${subtotal.toFixed(2)}`, valueX, summaryY, { width: summaryW, align: "right" });

    summaryY += 18;

    // Discount row (only when a coupon was applied)
    if (order.couponCode && order.discountAmount) {
      doc
        .fillColor("#DC2626")
        .font("Helvetica")
        .fontSize(9.5)
        .text(`Discount (${order.couponCode})`, labelX, summaryY)
        .text(`- Rs. ${order.discountAmount.toFixed(2)}`, valueX, summaryY, { width: summaryW, align: "right" });

      summaryY += 18;
    }

    // Total row — highlighted
    doc.rect(labelX - 8, summaryY - 5, contentW - (labelX - margin) + 8, 26).fill(BLUE);

    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .text("TOTAL AMOUNT", labelX, summaryY + 3)
      .text(`Rs. ${order.totalAmount.toFixed(2)}`, valueX, summaryY + 3, { width: summaryW, align: "right" });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc
      .moveTo(margin, footerY)
      .lineTo(margin + contentW, footerY)
      .strokeColor(BORDER)
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Thank you for shopping with OnDemand",
        margin,
        footerY + 12,
        { align: "center", width: contentW }
      );

    // ── Finalise ─────────────────────────────────────────────────────────────
    doc.end();
  } catch (error) {
    console.error("generateInvoice error:", error);
    // Only send JSON error if headers haven't been flushed yet
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Server error while generating invoice." });
    }
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
  generateInvoice,
};