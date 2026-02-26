const Order = require("../models/Order");
const Cart = require("../models/Cart");
const VendorProfile = require("../models/VendorsProfile");

// ─────────────────────────────────────────────
// @desc    Place a new order from the customer's cart
// @route   POST /api/orders
// @access  Customer only
// ─────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Build items snapshot and calculate total
    const itemsSnapshot = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
    }));

    const totalAmount = itemsSnapshot.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Derive vendorId from the first product in the cart
    const vendorId = cart.items[0].productId.vendorId;

    const order = await Order.create({
      customerId: req.user._id,
      vendorId,
      items: itemsSnapshot,
      totalAmount,
      status: "pending",
    });

    // Clear the cart after order is placed
    cart.items = [];
    await cart.save();

    return res.status(201).json(order);
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

    // Ensure this order belongs to the requesting vendor
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