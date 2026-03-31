import { useState, useEffect } from "react";
import api from "../../api/axios";

/* ── Star Display ── */
const Stars = ({ rating, interactive = false, onSelect }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onSelect(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-colors ${interactive ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className={(hovered || rating) >= star ? "text-amber-400" : "text-slate-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   ReviewsSection Component
══════════════════════════════════════════ */
const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

  // Check if user is logged in as customer
  const token = localStorage.getItem("ondemand_token");
  const isCustomer = !!token;
  const user = null; // kept for delete button compatibility

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setFormMessage({ text: "Please select a star rating", type: "error" });
      return;
    }

    setSubmitting(true);
    setFormMessage({ text: "", type: "" });

    try {
      await api.post("/reviews", { productId, rating, comment });
      setFormMessage({ text: "Review submitted successfully!", type: "success" });
      setRating(0);
      setComment("");
      fetchReviews(); // refresh reviews
    } catch (error) {
      setFormMessage({
        text: error.response?.data?.message || "Failed to submit review",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-800">Reviews & Ratings</h2>
          {totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(averageRating)} />
              <span className="text-sm font-bold text-slate-700">
                {averageRating} / 5
              </span>
              <span className="text-xs text-slate-400">({totalReviews} reviews)</span>
            </div>
          )}
        </div>

        {/* Review Form — only for logged in customers */}
        {isCustomer && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Write a Review</h3>

            {/* Star selector */}
            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-1">Your Rating</p>
              <Stars rating={rating} interactive onSelect={setRating} />
            </div>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Form message */}
            {formMessage.text && (
              <p className={`text-xs mt-2 font-medium ${
                formMessage.type === "error" ? "text-red-500" : "text-green-600"
              }`}>
                {formMessage.text}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-3 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-6">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {review.customerId?.name || "Customer"}
                    </p>
                    <Stars rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                    {/* Delete button — only show for own reviews */}
                    {user?._id === review.customerId?._id && (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;