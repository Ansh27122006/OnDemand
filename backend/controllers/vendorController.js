const VendorProfile = require("../models/VendorsProfile");
const Product = require("../models/Product");   
const Service = require("../models/Service");  

// @desc    Create a vendor profile
// @route   POST /api/vendors
// @access  Private (vendor)
const createVendorProfile = async (req, res) => {
  try {
    const {
      storeName,
      description,
      category,
      logo,
      website,
      instagram,
      facebook,
      twitter,
      youtube,
    } = req.body;

    const existing = await VendorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Vendor profile already exists for this user" });
    }

    const logoUrl = req.file ? req.file.secure_url : logo || undefined;

    const profile = await VendorProfile.create({
      userId: req.user._id,
      storeName,
      description,
      category,
      logo: logoUrl,
      // ── Social media & website (all optional) ──
      ...(website   && { website }),
      ...(instagram && { instagram }),
      ...(facebook  && { facebook }),
      ...(twitter   && { twitter }),
      ...(youtube   && { youtube }),
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

    const allowedFields = [
      "storeName",
      "description",
      "category",
      "logo",
      // ── Social media & website (all optional) ──
      "website",
      "instagram",
      "facebook",
      "twitter",
      "youtube",
    ];
    if (isAdmin) allowedFields.push("isApproved");

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

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

// @desc    Get vendor store (products + services)
// @route   GET /api/vendors/:vendorId/store
// @access  Public
const getVendorStore = async (req, res) => {
  try {
    const { vendorId } = req.params;

    let vendor = await VendorProfile.findById(vendorId).populate('userId', 'name');
    
    if (!vendor) {
      vendor = await VendorProfile.findOne({ userId: vendorId }).populate('userId', 'name');
    }

    if (!vendor || !vendor.isApproved) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const [products, services] = await Promise.all([
      Product.find({ vendorId: vendor._id }),
      Service.find({ vendorId: vendor._id }),
    ]);

    const vendorSaleInfo = { onSale: vendor.onSale, salePercentage: vendor.salePercentage };
    const productsWithVendor = products.map(p => ({ ...p.toObject(), vendorId: { ...vendorSaleInfo, _id: vendor._id, storeName: vendor.storeName } }));
    const servicesWithVendor = services.map(s => ({ ...s.toObject(), vendorId: { ...vendorSaleInfo, _id: vendor._id, storeName: vendor.storeName } }));

    res.status(200).json({ vendor, products: productsWithVendor, services: servicesWithVendor });
  } catch (error) {
    console.error('getVendorStore error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle store sale on/off
// @route   PUT /api/vendors/toggle-sale
// @access  Vendor only
const toggleSale = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOne({ userId: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    if (vendor.onSale) {
      vendor.onSale = false;
      vendor.salePercentage = 0;
    } else {
      const { salePercentage } = req.body;
      if (!salePercentage || salePercentage === 0) {
        return res.status(400).json({ message: "Please provide a sale percentage" });
      }
      vendor.onSale = true;
      vendor.salePercentage = salePercentage;
    }

    await vendor.save();
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getAllApprovedVendors,
  getVendorStore,
  toggleSale,
};