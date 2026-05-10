const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware.js");
const {
  addService,
  getAllServices,
  getServicesByVendor,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceCategories,
  getServicesByCategory,
} = require("../controllers/serviceController.js");
const { upload } = require("../config/cloudinary.js");

router.post(
  "/",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  addService
);

router.get("/", getAllServices);

// ── IMPORTANT: These static routes MUST be before /:id ──────────────────────

// @desc  Get all unique service categories
// @route GET /api/services/categories
// @access Public
router.get("/categories", getServiceCategories);

// @desc  Get services filtered by category
// @route GET /api/services/category/:category
// @access Public
router.get("/category/:category", getServicesByCategory);

// @desc  Get vendor's own services
// @route GET /api/services/my/list
// @access Vendor only
router.get("/my/list", protect, authorizeRoles("vendor"), getMyServices);

// @desc  Get all services by a specific vendor
// @route GET /api/services/vendor/:vendorId
// @access Public
router.get("/vendor/:vendorId", getServicesByVendor);

// ── Dynamic :id routes MUST come after all static routes ────────────────────

router.get("/:id", getServiceById);

router.put(
  "/:id",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  updateService
);

router.delete("/:id", protect, authorizeRoles("vendor"), deleteService);

module.exports = router;
