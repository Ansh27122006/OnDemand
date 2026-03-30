const User = require("../models/User");
const VendorProfile = require("../models/VendorsProfile");
const Product = require("../models/Product");
const Service = require("../models/Service");
const Order = require("../models/Order");
const Bookings = require("../models/Bookings");

// @desc    Get all users (excluding passwords)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.user._id.toString() === req.params.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all vendor profiles (approved and pending)
// @route   GET /api/admin/vendors
// @access  Admin
const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve a vendor profile
// @route   PUT /api/admin/vendors/:id/approve
// @access  Admin
const approveVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    vendor.isApproved = true;
    const updatedVendor = await vendor.save();

    res
      .status(200)
      .json({ message: "Vendor approved successfully", vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject (unapprove) a vendor profile
// @route   PUT /api/admin/vendors/:id/reject
// @access  Admin
const rejectVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    vendor.isApproved = false;
    const updatedVendor = await vendor.save();

    res
      .status(200)
      .json({ message: "Vendor rejected successfully", vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a product by ID
// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get platform-wide stats
// @route   GET /api/admin/stats
// @access  Admin
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalServices,
      totalOrders,
      totalBookings,
    ] = await Promise.all([
      User.countDocuments(),
      VendorProfile.countDocuments(),
      Product.countDocuments(),
      Service.countDocuments(),
      Order.countDocuments(),
      Bookings.countDocuments(),
    ]);

    res.status(200).json({
      totalUsers,
      totalVendors,
      totalProducts,
      totalServices,
      totalOrders,
      totalBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Admin
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("vendorId", "storeName")
      .sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a service by ID
// @route   DELETE /api/admin/services/:id
// @access  Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    await service.deleteOne();
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
  deleteProduct,
  getAllServices,
  deleteService,
  getPlatformStats,
};
