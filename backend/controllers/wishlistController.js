const Wishlist = require("../models/Wishlist");

// @desc    Get the logged-in customer's wishlist
// @route   GET /api/wishlist
// @access  Private (customer)
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      customerId: req.user._id,
    }).populate("items.productId", "name price image category");

    if (!wishlist) {
      return res.status(200).json({ items: [] });
    }

    res.status(200).json({ items: wishlist.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a product to the wishlist
// @route   POST /api/wishlist
// @access  Private (customer)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // Check if the item is already in the wishlist before upserting
    const existing = await Wishlist.findOne({
      customerId: req.user._id,
      "items.productId": productId,
    });

    if (existing) {
      return res.status(200).json({ message: "Already in wishlist" });
    }

    // Find or create the wishlist and push the new item
    const wishlist = await Wishlist.findOneAndUpdate(
      { customerId: req.user._id },
      { $push: { items: { productId } } },
      { new: true, upsert: true }
    ).populate("items.productId", "name price image category");

    res.status(200).json({ message: "Added to wishlist", items: wishlist.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove a product from the wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private (customer)
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { customerId: req.user._id },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate("items.productId", "name price image category");

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json({ message: "Removed from wishlist", items: wishlist.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Clear all items from the wishlist
// @route   DELETE /api/wishlist
// @access  Private (customer)
const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { customerId: req.user._id },
      { $set: { items: [] } },
      { new: true }
    );

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};