import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ReviewsSection from "./ReviewsSection";

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("ondemand_token")}`,
});

const getDiscountedPrice = (product) => {
  const productDiscount = product.discountPercentage || 0;
  const storeDiscount = product.vendorId?.onSale ? (product.vendorId.salePercentage || 0) : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0) return { finalPrice: product.price, discount: 0, isStoreSale: false };
  const finalPrice = Math.round(product.price - (product.price * effectiveDiscount / 100));
  return { finalPrice, discount: effectiveDiscount, isStoreSale: product.vendorId?.onSale && storeDiscount >= productDiscount };
};

const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 text-sm font-medium rounded-2xl shadow-2xl animate-slide-up ${
    type === "info" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : type === "error" ? "bg-red-50 text-red-700 border border-red-200"
    : "bg-slate-900 text-white"
  }`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
      type === "info" ? "bg-amber-400" : type === "error" ? "bg-red-400" : "bg-green-400"
    }`}>
      {type === "info" ? (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
        </svg>
      ) : (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    {message}
    <button onClick={onClose} className={`ml-2 transition-colors ${type === "success" ? "text-slate-400 hover:text-white" : "opacity-60 hover:opacity-100"}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading product...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    </div>
    <div>
      <p className="text-slate-700 font-bold text-lg">Product Not Found</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
    </div>
    <Link to="/products" className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
      ← Back to Products
    </Link>
  </div>
);

const StockBadge = ({ stock }) => {
  if (stock === undefined || stock === null) return null;
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> In Stock ({stock} available)
    </span>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isCustomer = user?.role === "customer";

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    try {
      await api.post("/cart", { productId: product._id, quantity });
      showToast(`"${product.name}" added to cart!`);
      setTimeout(() => navigate("/customer/cart"), 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add to cart", "error");
    }
  };

  const handleSaveToWishlist = async () => {
    if (!product) return;
    try {
      setWishlistLoading(true);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      if (data.message === "Already in wishlist") {
        showToast("Already in wishlist", "info");
      } else if (!res.ok) {
        throw new Error(data.message || "Failed to save to wishlist");
      } else {
        showToast("Added to Wishlist!");
      }
    } catch (err) {
      showToast(err.message || "Failed to save to wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const images = product?.images?.length > 0 ? product.images : product?.image ? [product.image] : [PLACEHOLDER];
  const isOutOfStock = product?.stock === 0;

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  const { finalPrice, discount, isStoreSale } = getDiscountedPrice(product);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-600 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                    {discount}% OFF
                  </span>
                  {isStoreSale && (
                    <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                      STORE SALE
                    </span>
                  )}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-blue-500 shadow-md" : "border-slate-200 hover:border-blue-300"
                    }`}>
                    <img src={img} alt={`${product.name} ${idx + 1}`} onError={(e) => { e.target.src = PLACEHOLDER; }} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center flex-wrap gap-2">
              {product.category && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                  {product.category}
                </span>
              )}
              <StockBadge stock={product.stock} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              {discount > 0 ? (
                <>
                  <span className="text-3xl font-black text-green-600">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-slate-400 line-through font-medium">
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-full border border-red-100">
                    {discount}% OFF
                  </span>
                  {isStoreSale && (
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-sm font-bold rounded-full border border-orange-100">
                      STORE SALE
                    </span>
                  )}
                </>
              ) : (
                <span className="text-3xl font-black text-blue-600">
                  ₹{parseFloat(product.price || 0).toFixed(2)}
                </span>
              )}
            </div>

            {product.description && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.vendorId?.storeName && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.35m-16.5 11.65V9.35" />
                </svg>
                Sold by <span className="font-semibold text-slate-700">{product.vendorId.storeName}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={isOutOfStock} className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="px-4 py-2.5 text-sm font-bold text-slate-700 min-w-[2.5rem] text-center border-x border-slate-200">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} disabled={isOutOfStock} className="px-3 py-2.5 text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              {isCustomer && (
                <button
                  onClick={handleSaveToWishlist}
                  disabled={wishlistLoading}
                  title="Save to Wishlist"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 font-bold text-sm rounded-xl border border-rose-200 hover:border-rose-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
                  {wishlistLoading ? (
                    <span className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
              )}
            </div>

            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors mt-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Products
            </Link>
          </div>
        </div>
      </div>

      <ReviewsSection productId={id} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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