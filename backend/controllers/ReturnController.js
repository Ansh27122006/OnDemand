const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const VendorProfile = require("../models/VendorsProfile");

// @desc    Create a return request
// @route   POST /api/returns
// @access  Customer only
const createReturnRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    // Fetch order and verify it belongs to this customer
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to return this order" });
    }

    // Only delivered orders can be returned
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    // Check if return request already exists for this order
    const existing = await ReturnRequest.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ message: "Return request already submitted for this order" });
    }

    const returnRequest = await ReturnRequest.create({
      orderId,
      customerId: req.user._id,
      vendorId: order.vendorId,
      reason,
    });

    res.status(201).json(returnRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all return requests for the logged-in customer
// @route   GET /api/returns/my
// @access  Customer only
const getMyReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find({ customerId: req.user._id })
      .populate("orderId", "items totalAmount")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all return requests for the logged-in vendor
// @route   GET /api/returns/vendor
// @access  Vendor only
const getVendorReturnRequests = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const requests = await ReturnRequest.find({ vendorId: vendor._id })
      .populate("orderId")
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve or reject a return request
// @route   PUT /api/returns/:id/status
// @access  Vendor only
const updateReturnStatus = async (req, res) => {
  try {
    const { status, vendorNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const returnRequest = await ReturnRequest.findById(req.params.id);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Verify this return request belongs to this vendor
    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor || returnRequest.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this return request" });
    }

    returnRequest.status = status;
    if (vendorNote !== undefined) returnRequest.vendorNote = vendorNote;

    // If approved, also update the Order status to 'returned'
    if (status === "approved") {
      await Order.findByIdAndUpdate(returnRequest.orderId, { status: "returned" });
    }

    const updated = await returnRequest.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all return requests (admin overview)
// @route   GET /api/returns/all
// @access  Admin only
const getAllReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find()
      .populate("orderId")
      .populate("customerId", "name")
      .populate("vendorId", "storeName")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
  getVendorReturnRequests,
  updateReturnStatus,
  getAllReturnRequests,
};