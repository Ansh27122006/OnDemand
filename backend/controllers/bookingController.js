const Booking = require("../models/Bookings");
const Service = require("../models/Service");
const VendorProfile = require("../models/VendorsProfile");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Customer only
const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate } = req.body;

    // Find the service to get price and vendorId
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Find the VendorProfile linked to the service
    const vendorProfile = await VendorProfile.findById(service.vendorId);
    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      vendorId: vendorProfile._id,
      serviceId,
      scheduledDate,
      totalAmount: service.price,
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all bookings for the logged-in customer
// @route   GET /api/bookings/my
// @access  Customer only
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate("serviceId", "name price")
      .populate("vendorId", "storeName");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all bookings for the logged-in vendor
// @route   GET /api/bookings/vendor
// @access  Vendor only
const getVendorBookings = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const bookings = await Booking.find({ vendorId: vendorProfile._id })
      .populate("customerId", "name email")
      .populate("serviceId", "name");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Vendor only
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    const allowedStatuses = ["pending", "confirmed", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the vendor's profile
    const vendorProfile = await VendorProfile.findOne({ userId: req.user._id });
    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Find the booking and verify it belongs to this vendor
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.vendorId.toString() !== vendorProfile._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    booking.status = status;
    const updatedBooking = await booking.save();

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Protected (customer and vendor)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name email")
      .populate("vendorId", "storeName")
      .populate("serviceId", "name price");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
  getBookingById,
};
