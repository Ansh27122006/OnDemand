const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    unique: true,
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);
