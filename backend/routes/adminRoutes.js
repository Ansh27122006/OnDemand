const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
  deleteProduct,
  getPlatformStats,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Apply protect + admin role guard to ALL routes in this file
router.use(protect);
router.use(authorizeRoles("admin"));

// ── Stats
// GET /api/admin/stats
router.get("/stats", getPlatformStats);

// ── Users
// GET    /api/admin/users
// DELETE /api/admin/users/:id
router.route("/users").get(getAllUsers);

router.route("/users/:id").delete(deleteUser);

// ── Vendors
// GET /api/admin/vendors
// PUT /api/admin/vendors/:id/approve
// PUT /api/admin/vendors/:id/reject
router.route("/vendors").get(getAllVendors);

router.route("/vendors/:id/approve").put(approveVendor);

router.route("/vendors/:id/reject").put(rejectVendor);

// ── Products
// DELETE /api/admin/products/:id
router.route("/products/:id").delete(deleteProduct);

module.exports = router;
