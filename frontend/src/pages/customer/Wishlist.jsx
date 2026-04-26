import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ondemand_token")}`,
});

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium border backdrop-blur-sm transition-all duration-300 ${
        type === "success"
          ? "bg-emerald-50/95 text-emerald-700 border-emerald-200"
          : "bg-red-50/95 text-red-700 border-red-200"
      }`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      {message}
      <button
        onClick={onClose}
        className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-base leading-none">
        ✕
      </button>
    </div>
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="h-52 bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-5 bg-gray-100 rounded-full w-3/4" />
      <div className="h-4 bg-gray-100 rounded-full w-1/4" />
      <div className="flex gap-2 pt-2">
        <div className="h-10 bg-gray-100 rounded-xl flex-1" />
        <div className="h-10 bg-gray-100 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const WishlistCard = ({
  item,
  onRemove,
  onAddToCart,
  removing,
  addingToCart,
}) => {
  const product = item.productId;
  if (!product) return null;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-rose-50 to-orange-50 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <svg
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-medium text-gray-300">No image</span>
          </div>
        )}
        {/* Remove button overlay */}
        <button
          onClick={() => onRemove(product._id)}
          disabled={removing}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Remove from wishlist">
          {removing ? (
            <span className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {product.category && (
          <span className="inline-block text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg mb-2 tracking-wide uppercase">
            {product.category}
          </span>
        )}
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xl font-extrabold text-gray-900 mb-4">
          ₹<span>{Number(product.price).toLocaleString("en-IN")}</span>
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product._id)}
            disabled={addingToCart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
            {addingToCart ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
            Add to Cart
          </button>
          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors duration-200 disabled:opacity-60 border border-gray-100 hover:border-red-100">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-rose-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg">
        ✨
      </div>
    </div>
    <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
      Your wishlist is empty
    </h3>
    <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
      Save products you love and come back to them anytime. Start exploring!
    </p>
    <Link
      to="/products"
      className="inline-flex items-center gap-2 px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-2xl transition-colors duration-200 shadow-sm hover:shadow-md">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
      Browse Products
    </Link>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Fetch wishlist ────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ── Remove item ───────────────────────────────────────────────────────────
  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      setItems((prev) =>
        prev.filter((item) => item.productId?._id !== productId)
      );
      showToast("Removed from wishlist");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      showToast("Added to cart!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  // ── Clear wishlist ────────────────────────────────────────────────────────
  const handleClear = async () => {
    if (!items.length) return;
    try {
      setClearing(true);
      const res = await fetch("/api/wishlist/clear", {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to clear wishlist");
      setItems([]);
      showToast("Wishlist cleared!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                My Wishlist{" "}
                {!loading && (
                  <span className="text-rose-400 font-bold">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Products you've saved for later
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-auto">
              {clearing ? (
                <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
              Clear Wishlist
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <WishlistCard
                key={item.productId?._id}
                item={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                removing={removingId === item.productId?._id}
                addingToCart={addingToCartId === item.productId?._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
