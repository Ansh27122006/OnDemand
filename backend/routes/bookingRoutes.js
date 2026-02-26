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

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking for a service (Customer only)
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledDate
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "64a1f2c3e4b5d6e7f8a9b0c3"
 *                 description: ID of the service to book
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-03-15T10:30:00Z"
 *                 description: Scheduled date and time for the service
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 customerId:
 *                   type: string
 *                 vendorId:
 *                   type: string
 *                 serviceId:
 *                   type: string
 *                 scheduledDate:
 *                   type: string
 *                   format: date-time
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, completed, cancelled]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Service or Vendor profile not found
 *       500:
 *         description: Server error
 */
router.post("/", protect, authorizeRoles("customer"), createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get customer's bookings
 *     description: Retrieve all bookings for the logged-in customer
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   vendorId:
 *                     type: string
 *                   serviceId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                   scheduledDate:
 *                     type: string
 *                     format: date-time
 *                   totalAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [pending, confirmed, completed, cancelled]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get("/my", protect, authorizeRoles("customer"), getMyBookings);

/**
 * @swagger
 * /bookings/vendor:
 *   get:
 *     summary: Get vendor's bookings
 *     description: Retrieve all bookings for the logged-in vendor
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   vendorId:
 *                     type: string
 *                   serviceId:
 *                     type: string
 *                   scheduledDate:
 *                     type: string
 *                     format: date-time
 *                   totalAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [pending, confirmed, completed, cancelled]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.get("/vendor", protect, authorizeRoles("vendor"), getVendorBookings);

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     description: Update the status of a booking (Vendor only)
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 customerId:
 *                   type: string
 *                 vendorId:
 *                   type: string
 *                 serviceId:
 *                   type: string
 *                 scheduledDate:
 *                   type: string
 *                   format: date-time
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("vendor"),
  updateBookingStatus
);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve a single booking by ID (Protected route)
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 customerId:
 *                   type: string
 *                 vendorId:
 *                   type: string
 *                 serviceId:
 *                   type: string
 *                 scheduledDate:
 *                   type: string
 *                   format: date-time
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [pending, confirmed, completed, cancelled]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getBookingById);

module.exports = router;
