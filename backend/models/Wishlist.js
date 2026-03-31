const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);