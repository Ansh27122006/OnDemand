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

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the catalog. Only vendors can create products.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop Pro"
 *               description:
 *                 type: string
 *                 example: "High-performance laptop for professionals"
 *               price:
 *                 type: number
 *                 example: 1299.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               stock:
 *                 type: integer
 *                 example: 50
 *               image:
 *                 type: string
 *                 example: "https://example.com/laptop.jpg"
 *               sku:
 *                 type: string
 *                 example: "LAPTOP-001"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only vendors can create products
 */
router.post(
  "/",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  addProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all available products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved all products
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("vendor"),
  upload.single("image"),
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, authorizeRoles("vendor"), deleteProduct);

module.exports = router;