const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Apply protect + admin role guard to ALL routes in this file
router.use(protect);
router.use(authorizeRoles("admin"));

// @route   GET /api/audit
// @desc    Get all audit logs (with optional action filter)
// @access  Admin
// @query   ?action=APPROVE_VENDOR (optional)
router.get("/", getAuditLogs);

module.exports = router;
