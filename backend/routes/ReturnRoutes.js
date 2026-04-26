const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createReturnRequest,
  getMyReturnRequests,
  getVendorReturnRequests,
  updateReturnStatus,
  getAllReturnRequests,
} = require("../controllers/ReturnController");

// ── IMPORTANT: static routes MUST be before /:id routes ──────────────────────

// POST /api/returns              -> Submit a return request (customer only)
router.post("/", protect, authorizeRoles("customer"), createReturnRequest);

// GET  /api/returns/my           -> Customer's own return requests
router.get("/my", protect, authorizeRoles("customer"), getMyReturnRequests);

// GET  /api/returns/vendor       -> Vendor's incoming return requests
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorReturnRequests);

// GET  /api/returns/all          -> All return requests (admin only)
router.get("/all", protect, authorizeRoles("admin"), getAllReturnRequests);

// PUT  /api/returns/:id/status   -> Approve or reject a return (vendor only)
router.put("/:id/status", protect, authorizeRoles("vendor"), updateReturnStatus);

module.exports = router;