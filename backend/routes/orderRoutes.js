const express = require("express");
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/orderController");

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router.post("/", protect, authorizeRoles("customer"), placeOrder);

// GET   /api/orders/my       -> Get logged-in customer's orders
/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get logged-in customer's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer orders retrieved
 */
router.get("/my", protect, authorizeRoles("customer"), getMyOrders);

// GET   /api/orders/vendor   -> Get logged-in vendor's orders
/**
 * @swagger
 * /orders/vendor:
 *   get:
 *     summary: Get logged-in vendor's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor orders retrieved
 */
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorOrders);

// PUT   /api/orders/:id/status -> Update order status (vendor only)
/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put("/:id/status", protect, authorizeRoles("vendor"), updateOrderStatus);

// GET   /api/orders/:id      -> Get single order by ID (customer + vendor)
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
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
 *         description: Order retrieved
 */
router.get("/:id", protect, getOrderById);

module.exports = router;
