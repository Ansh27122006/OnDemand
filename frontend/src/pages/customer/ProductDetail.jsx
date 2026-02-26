import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

/* ── Toast Notification ── */
const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white text-sm font-medium rounded-2xl shadow-2xl animate-slide-up">
    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shrink-0">
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    {message}
    <button
      onClick={onClose}
      className="ml-2 text-slate-400 hover:text-white transition-colors">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

/* ── Loading Spinner ── */
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading product...</p>
  </div>
);

/* ── Error State ── */
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
      <svg
        className="w-8 h-8 text-red-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
        />
      </svg>
    </div>
    <div>
      <p className="text-slate-700 font-bold text-lg">Product Not Found</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
    </div>
    <Link
      to="/products"
      className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
      ← Back to Products
    </Link>
  </div>
);

/* ── Stock Badge ── */
const StockBadge = ({ stock }) => {
  if (stock === undefined || stock === null) return null;
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      In Stock ({stock} available)
    </span>
  );
};

/* ══════════════════════════════════════════
   ProductDetail Page
══════════════════════════════════════════ */
const ProductDetail = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);

  // Fetch product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data.product || res.data;
        setProduct(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "This product does not exist or has been removed."
            : "Failed to load product. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    setToast(`"${product.name}" added to cart!`);
  };

  const images =
    product?.images?.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [PLACEHOLDER];

  const isOutOfStock = product?.stock === 0;

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <Link
            to="/products"
            className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-slate-600 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Left: Image Gallery ── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={images[selectedImage]}
                alt={product.name}
                onError={(e) => {
                  e.target.src = PLACEHOLDER;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails — only show if more than 1 image */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-blue-500 shadow-md"
                        : "border-slate-200 hover:border-blue-300"
                    }`}>
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col gap-5">
            {/* Category + Stock */}
            <div className="flex items-center flex-wrap gap-2">
              {product.category && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                  {product.category}
                </span>
              )}
              <StockBadge stock={product.stock} />
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">
                ${parseFloat(product.price || 0).toFixed(2)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-lg text-slate-400 line-through font-medium">
                    ${parseFloat(product.originalPrice).toFixed(2)}
                  </span>
                )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Description
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Vendor info if present */}
            {product.vendorId?.storeName && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.35m-16.5 11.65V9.35"
                  />
                </svg>
                Sold by{" "}
                <span className="font-semibold text-slate-700">
                  {product.vendorId.storeName}
                </span>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 pt-2">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="px-4 py-2.5 text-sm font-bold text-slate-700 min-w-[2.5rem] text-center border-x border-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 99, q + 1))
                  }
                  disabled={isOutOfStock}
                  className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* Back link */}
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors mt-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Slide-up animation ── */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(1rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>
    </div>
  );
};

export default ProductDetail;
