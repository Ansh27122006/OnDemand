const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware.js');
const {
  addProduct,
  getAllProducts,
  getProductsByVendor,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController.js');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 vendorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only vendors can create products
 */
router.post('/', protect, authorizeRoles('vendor'), addProduct);

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
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *     responses:
 *       200:
 *         description: Successfully retrieved all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   stock:
 *                     type: integer
 *                   vendorId:
 *                     type: string
 *                   image:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/vendor/{vendorId}:
 *   get:
 *     summary: Get products by vendor
 *     description: Retrieve all products offered by a specific vendor
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vendor
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   vendorId:
 *                     type: string
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Server error
 */
router.get('/vendor/:vendorId', getProductsByVendor);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 category:
 *                   type: string
 *                 stock:
 *                   type: integer
 *                 vendorId:
 *                   type: string
 *                 image:
 *                   type: string
 *                 sku:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update product details. Only the vendor who created the product can update it.
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
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop Pro Plus"
 *               description:
 *                 type: string
 *                 example: "Enhanced high-performance laptop"
 *               price:
 *                 type: number
 *                 example: 1499.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               stock:
 *                 type: integer
 *                 example: 40
 *               image:
 *                 type: string
 *                 example: "https://example.com/laptop-new.jpg"
 *               sku:
 *                 type: string
 *                 example: "LAPTOP-002"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only the vendor owner can update
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, authorizeRoles('vendor'), updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product from the catalog. Only the vendor who created the product can delete it.
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
 *         description: The ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 *       401:
 *         description: Unauthorized - No valid token provided
 *       403:
 *         description: Forbidden - Only the vendor owner can delete
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorizeRoles('vendor'), deleteProduct);

module.exports = router;