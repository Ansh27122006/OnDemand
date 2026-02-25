const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createBooking,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
} = require('../controllers/bookingController');

// POST  /api/bookings           -> Create a new booking (customer only)
router.post('/', protect, authorizeRoles('customer'), createBooking);

// GET   /api/bookings/my        -> Get logged-in customer's bookings
router.get('/my', protect, authorizeRoles('customer'), getMyBookings);

// GET   /api/bookings/vendor    -> Get logged-in vendor's bookings
router.get('/vendor', protect, authorizeRoles('vendor'), getVendorBookings);

// PUT   /api/bookings/:id/status -> Update booking status (vendor only)
router.put('/:id/status', protect, authorizeRoles('vendor'), updateBookingStatus);

// GET   /api/bookings/:id       -> Get single booking by ID (protected)
router.get('/:id', protect, getBookingById);

module.exports = router;