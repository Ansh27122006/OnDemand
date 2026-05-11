const express = require("express");
const router = express.Router();
const {
  saveDailySnapshot,
  getAnalytics,
} = require("../controllers/analyticsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Apply protect + admin role guard to ALL routes in this file
router.use(protect);
router.use(authorizeRoles("admin"));

// POST /api/analytics/snapshot - Save today's daily snapshot
router.post("/snapshot", saveDailySnapshot);

// GET /api/analytics - Get all analytics data
router.get("/", getAnalytics);

module.exports = router;
