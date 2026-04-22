const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const VendorProfile = require("../models/VendorsProfile");

// helper — same logic as frontend
const getDiscountedPrice = (product) => {
  const productDiscount = product.discountPercentage || 0;
  const storeDiscount = product.vendorId?.onSale ? (product.vendorId.salePercentage || 0) : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0) return { finalPrice: product.price, discount: 0 };
  const finalPrice = Math.round(product.price - (product.price * effectiveDiscount / 100));
  return { finalPrice, discount: effectiveDiscount };
};

// ─────────────────────────────────────────────
// @desc    Place a new order from the customer's cart
// @route   POST /api/orders
// @access  Customer only
// ─────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
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
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock === undefined || product.stock === null) {
        return res.status(400).json({ message: `Product "${product.name}" does not have stock information` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // group items by vendor
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
          price: finalPrice,           // discounted price saved
          originalPrice: item.productId.price, // original price saved for reference
          discountApplied: discount,
          quantity: item.quantity,
        };
      });

      const vendorTotal = itemsSnapshot.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = await Order.create({
        customerId: req.user._id,
        vendorId,
        items: itemsSnapshot,
        totalAmount: vendorTotal,
        status: "pending",
      });

      createdOrders.push(order);
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

    return res.status(201).json({ message: "Orders placed", orders: createdOrders });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res.status(500).json({ message: "Server error while placing order." });
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
    return res.status(500).json({ message: "Server error while fetching orders." });
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
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("getVendorOrders error:", error);
    return res.status(500).json({ message: "Server error while fetching vendor orders." });
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
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}.`,
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
      return res.status(403).json({ message: "Not authorised to update this order." });
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({ message: "Server error while updating order status." });
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
    return res.status(500).json({ message: "Server error while fetching order." });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
};