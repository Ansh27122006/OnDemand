const Coupon = require("../models/Coupon");
const VendorProfile = require("../models/VendorsProfile");

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Vendor only
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate } =
      req.body;

    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor)
      return res.status(404).json({ message: "Vendor profile not found" });

    const upperCode = code.toUpperCase();

    const existing = await Coupon.findOne({ code: upperCode });
    if (existing)
      return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await Coupon.create({
      code: upperCode,
      vendorId: vendor._id,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
    });

    res.status(201).json(coupon);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.response?.data?.message || "Something went wrong" });
  }
};

// @desc    Get all coupons for logged in vendor
// @route   GET /api/coupons/vendor
// @access  Vendor only
const getVendorCoupons = async (req, res) => {
  try {
    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor)
      return res.status(404).json({ message: "Vendor profile not found" });

    const coupons = await Coupon.find({ vendorId: vendor._id }).sort({
      createdAt: -1,
    });

    res.json(coupons);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.response?.data?.message || "Something went wrong" });
  }
};

// @desc    Toggle coupon active/inactive
// @route   PUT /api/coupons/:id/toggle
// @access  Vendor only
const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor || coupon.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.response?.data?.message || "Something went wrong" });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Vendor only
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    const vendor = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendor || coupon.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await coupon.deleteOne();
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.response?.data?.message || "Something went wrong" });
  }
};

// @desc    Validate a coupon code at checkout
// @route   POST /api/coupons/validate
// @access  Customer only
const validateCoupon = async (req, res) => {
  try {
    const { code, vendorId, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      vendorId,
      isActive: true,
    });

    if (!coupon)
      return res.status(404).json({ message: "Invalid coupon code" });

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is Rs. ${coupon.minOrderAmount}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Cap discount so it never exceeds cart total
    discountAmount = Math.min(discountAmount, cartTotal);
    discountAmount = Math.round(discountAmount * 100) / 100; // round to 2 decimals

    const finalAmount = cartTotal - discountAmount;

    res.json({
      valid: true,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.response?.data?.message || "Something went wrong" });
  }
};

module.exports = {
  createCoupon,
  getVendorCoupons,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
};
