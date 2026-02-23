const VendorProfile = require("../models/VendorsProfile");

// @desc    Create a vendor profile
// @route   POST /api/vendors
// @access  Private (vendor)
const createVendorProfile = async (req, res) => {
  try {
    const { storeName, description, category, logo } = req.body;

    // Prevent duplicate profiles for the same user
    const existing = await VendorProfile.findOne({ userId: req.user.id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Vendor profile already exists for this user" });
    }

    const profile = await VendorProfile.create({
      userId: req.user.id,
      storeName,
      description,
      category,
      logo,
    });

    res.status(201).json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a vendor profile by ID
// @route   GET /api/vendors/:id
// @access  Public
const getVendorProfile = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a vendor profile
// @route   PUT /api/vendors/:id
// @access  Private (vendor who owns the profile, or admin)
const updateVendorProfile = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Only the owning vendor or an admin can update
    const isOwner = profile.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const allowedFields = ["storeName", "description", "category", "logo"];

    // Admins can also update isApproved
    if (isAdmin) allowedFields.push("isApproved");

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    const updatedProfile = await profile.save();

    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all approved vendor profiles
// @route   GET /api/vendors
// @access  Public
const getAllApprovedVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find({ isApproved: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getAllApprovedVendors,
};
