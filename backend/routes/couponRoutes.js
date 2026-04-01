const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getVendorCoupons,
  toggleCoupon,
  deleteCoupon,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("vendor"), createCoupon);

router.get("/vendor", protect, authorizeRoles("vendor"), getVendorCoupons);

// IMPORTANT — /vendor and /validate routes must be above /:id
// to avoid Express matching them as an id parameter
router.post("/validate", protect, authorizeRoles("customer"), validateCoupon);

router.put("/:id/toggle", protect, authorizeRoles("vendor"), toggleCoupon);

router.delete("/:id", protect, authorizeRoles("vendor"), deleteCoupon);

module.exports = router;
