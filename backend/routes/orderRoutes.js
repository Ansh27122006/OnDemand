const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  getOrderById,
  generateInvoice,
} = require("../controllers/orderController");

router.post("/", protect, authorizeRoles("customer"), placeOrder);

// GET   /api/orders/my       -> Get logged-in customer's orders
router.get("/my", protect, authorizeRoles("customer"), getMyOrders);

// GET   /api/orders/vendor   -> Get logged-in vendor's orders
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorOrders);

// PUT   /api/orders/:id/status -> Update order status (vendor only)
router.put("/:id/status", protect, authorizeRoles("vendor"), updateOrderStatus);

// GET   /api/orders/:id/invoice -> Download PDF invoice (customer only)
router.get(
  "/:id/invoice",
  protect,
  authorizeRoles("customer"),
  generateInvoice
);

// GET   /api/orders/:id      -> Get single order by ID (customer + vendor)
router.get("/:id", protect, getOrderById);

module.exports = router;
