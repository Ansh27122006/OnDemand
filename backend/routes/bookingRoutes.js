const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
} = require("../controllers/bookingController");

router.post("/", protect, authorizeRoles("customer"), createBooking);
router.get("/my", protect, authorizeRoles("customer"), getMyBookings);
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorBookings);
router.put(
  "/:id/status",
  protect,
  authorizeRoles("vendor"),
  updateBookingStatus
);
router.get("/:id", protect, getBookingById);

module.exports = router;
