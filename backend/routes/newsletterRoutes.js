const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
} = require("../controllers/newsletterController");

const router = express.Router();

/**
 * PUBLIC ROUTES (no authentication required)
 */

// Subscribe to newsletter
router.post("/subscribe", subscribe);

// Unsubscribe from newsletter
router.post("/unsubscribe", unsubscribe);

/**
 * ADMIN ONLY ROUTES
 */

// Get all subscribers (admin only)
router.get("/", protect, authorizeRoles("admin"), getAllSubscribers);

// Delete a subscriber (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteSubscriber);

module.exports = router;
