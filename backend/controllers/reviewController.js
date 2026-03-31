const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Customer only
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Verify customer has actually ordered this product
    const qualifyingOrder = await Order.findOne({
      customerId: req.user._id,
      'items.productId': productId,
      status: { $in: ['confirmed', 'delivered'] },
    });

    if (!qualifyingOrder) {
      return res.status(400).json({
        message: 'You can only review products you have received',
      });
    }

    // Check if review already exists
    const existing = await Review.findOne({
      customerId: req.user._id,
      productId,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Get vendorId from product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await Review.create({
      customerId: req.user._id,
      productId,
      vendorId: product.vendorId,
      rating,
      comment,
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
// @access  Customer only
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addReview, getProductReviews, deleteReview };