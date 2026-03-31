const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// POST /api/reviews — Customer only
router.post('/', protect, authorizeRoles('customer'), addReview);

// GET /api/reviews/:productId — Public
router.get('/:productId', getProductReviews);

// DELETE /api/reviews/:id — Customer only
router.delete('/:id', protect, authorizeRoles('customer'), deleteReview);

module.exports = router;