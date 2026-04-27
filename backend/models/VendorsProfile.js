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
    enum: [
      "Electronics & Gadgets",
      "Food & Beverages",
      "Home Services",
      "Fashion & Clothing",
      "Health & Beauty",
      "Education & Training",
      "Repair & Maintenance",
      "IT & Technology",
      "Healthcare & Medical",
      "Transportation & Logistics",
      "Construction & Real Estate",
      "Financial Services",
      "Events & Entertainment",
      "Marketing & Advertising",
      "Cleaning Services",
      "Security Services",
      "Legal Services",
      "Photography & Media",
      "Sports & Fitness",
      "Automotive",
      "Pet Services",
      "Rental Services",
      "Agriculture",
      "Childcare & Senior Care",
      "Other",
    ],
    required: true,
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "blocked"],
    default: "pending",
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
  blockReason: {
    type: String,
    default: "",
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  salePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ── Social media & website links (all optional) ──
  website: {
    type: String,
    default: "",
  },
  instagram: {
    type: String,
    default: "",
  },
  facebook: {
    type: String,
    default: "",
  },
  twitter: {
    type: String,
    default: "",
  },
  youtube: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);