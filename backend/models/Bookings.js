const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VendorProfile",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
