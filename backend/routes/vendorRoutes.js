const express = require("express");
const router = express.Router();
const {
  createVendorProfile,
  getVendorProfile,
  updateVendorProfile,
  getAllApprovedVendors,
  getVendorStore,
  toggleSale,
} = require("../controllers/vendorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const VendorProfile = require("../models/VendorsProfile");
const { upload } = require("../config/cloudinary.js");

router.get("/", getAllApprovedVendors);
router.post(
  "/",
  protect,
  authorizeRoles("vendor", "admin"),
  upload.single("logo"),
  createVendorProfile
);

// ⚠️ MUST be defined before /:id so Express doesn't treat "profile" as an id param
router.get("/profile", protect, async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.status(200).json({
      _id: profile._id,
      vendorId: profile._id,
      storeName: profile.storeName,
      businessName: profile.storeName,
      description: profile.description,
      category: profile.category,
      contact: profile.contact,
      location: profile.location,
      logo: profile.logo,
      isApproved: profile.isApproved,
      onSale: profile.onSale,
      salePercentage: profile.salePercentage,
      userId: profile.userId,
      website: profile.website,
      instagram: profile.instagram,
      facebook: profile.facebook,
      twitter: profile.twitter,
      youtube: profile.youtube,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ⚠️ MUST be before /:id
router.put("/toggle-sale", protect, authorizeRoles("vendor"), toggleSale);

router.get("/:vendorId/store", getVendorStore);

router.get("/:id", getVendorProfile);

router.put(
  "/:id",
  protect,
  authorizeRoles("vendor", "admin"),
  upload.single("logo"),
  updateVendorProfile
);

module.exports = router;
