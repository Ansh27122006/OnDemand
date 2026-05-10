const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware.js");
const {
  addProduct,
  getAllProducts,
  getProductsByVendor,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getProductsByCategory,
} = require("../controllers/productController.js");
const { upload } = require("../config/cloudinary.js");

router.post(
  "/",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  addProduct
);

router.get("/", getAllProducts);

// ── IMPORTANT: These static routes MUST be before /:id ──────────────────────

// @desc  Get all unique product categories
// @route GET /api/products/categories
// @access Public
router.get("/categories", getProductCategories);

// @desc  Get products filtered by category
// @route GET /api/products/category/:category
// @access Public
router.get("/category/:category", getProductsByCategory);

// @desc  Get vendor's own products
// @route GET /api/products/my/list
// @access Vendor only
router.get("/my/list", protect, authorizeRoles("vendor"), getMyProducts);

// @desc  Get all products by a specific vendor
// @route GET /api/products/vendor/:vendorId
// @access Public
router.get("/vendor/:vendorId", getProductsByVendor);

// ── Dynamic :id routes MUST come after all static routes ────────────────────

router.get("/:id", getProductById);

router.put(
  "/:id",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  updateProduct
);

router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

module.exports = router;
