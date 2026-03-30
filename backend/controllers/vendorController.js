const VendorProfile = require("../models/VendorsProfile");

// @desc    Create a vendor profile
// @route   POST /api/vendors
// @access  Private (vendor)
const createVendorProfile = async (req, res) => {
  try {
    const { storeName, description, category, logo } = req.body;

    const existing = await VendorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Vendor profile already exists for this user" });
    }

    // use uploaded file URL if present, else body logo, else undefined
    const logoUrl = req.file ? req.file.secure_url : logo || undefined;

    const profile = await VendorProfile.create({
      userId: req.user._id,
      storeName,
      description,
      category,
      logo: logoUrl,
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

    const isOwner = profile.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const allowedFields = ["storeName", "description", "category", "logo"];
    if (isAdmin) allowedFields.push("isApproved");

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    // if a new file was uploaded, override logo with it
    if (req.file) {
      profile.logo = req.file.secure_url;
    }

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


// ============================================================
// ADD THIS FUNCTION to controllers/vendorController.js
// Place it BEFORE the module.exports at the bottom
// ============================================================

const getVendorStore = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Fetch vendor profile and populate owner name
    const vendor = await VendorProfile.findById(vendorId).populate('userId', 'name');

    // Return 404 if vendor not found or not approved
    if (!vendor || !vendor.isApproved) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Fetch products and services in parallel
    const [products, services] = await Promise.all([
      Product.find({ vendorId }),
      Service.find({ vendorId }),
    ]);

    res.status(200).json({ vendor, products, services });
  } catch (error) {
    console.error('getVendorStore error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================
// ADD THIS TO module.exports in vendorController.js
// e.g.  module.exports = { ..., getVendorStore };
// ============================================================


// ============================================================
// ADD THIS ROUTE to routes/vendorRoutes.js
// IMPORTANT: Place this line BEFORE any /:id routes
// ============================================================

// At the top of vendorRoutes.js, add to your imports:
// const { getVendorStore } = require('../controllers/vendorController');

// Then add the route (BEFORE /:id routes):
// router.get('/:vendorId/store', getVendorStore);