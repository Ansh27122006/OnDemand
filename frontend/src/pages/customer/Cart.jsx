import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* ── Toast ── */
const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 text-white text-sm font-medium rounded-2xl shadow-2xl animate-slide-up ${
      type === "success" ? "bg-slate-900" : "bg-red-600"
    }`}>
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        type === "success" ? "bg-green-400" : "bg-white/30"
      }`}>
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}>
        {type === "success" ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        )}
      </svg>
    </div>
    {message}
    <button
      onClick={onClose}
      className="ml-2 text-white/60 hover:text-white transition-colors">
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

/* ── Spinner ── */
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading your cart...</p>
  </div>
);

/* ── Empty Cart ── */
const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-4">
    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center">
      <svg
        className="w-10 h-10 text-blue-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    </div>
    <div>
      <p className="text-xl font-black text-slate-800">Your cart is empty</p>
      <p className="text-slate-400 text-sm mt-2 max-w-xs">
        Looks like you haven't added anything yet. Browse our products and find
        something you love.
      </p>
    </div>
    <Link
      to="/products"
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
      Browse Products
    </Link>
  </div>
);

/* ── Cart Item Row ── */
const CartItem = ({ item, onIncrease, onDecrease, onRemove, updating }) => {
  const image =
    item.productId?.images?.[0] ||
    item.productId?.image ||
    "https://placehold.co/80x80?text=?";
  const name = item.productId?.name || item.name || "Unknown Product";
  const price = parseFloat(item.productId?.price || item.price || 0);
  const subtotal = (price * item.quantity).toFixed(2);
  const isUpdating = updating === item._id;

  return (
    <div
      className={`flex gap-4 p-4 sm:p-5 transition-opacity ${
        isUpdating ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}>
      {/* Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
        <img
          src={image}
          alt={name}
          onError={(e) => {
            e.target.src = "https://placehold.co/80x80?text=?";
          }}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
          {name}
        </h3>
        {item.productId?.category && (
          <span className="text-xs text-slate-400">
            {item.productId.category}
          </span>
        )}
        <p className="text-sm font-black text-blue-600">
          ${price.toFixed(2)}{" "}
          <span className="text-slate-400 font-normal text-xs">each</span>
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        {/* Subtotal */}
        <p className="text-sm font-black text-slate-800">${subtotal}</p>

        {/* Quantity controls */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button
            onClick={() => onDecrease(item._id, item.quantity)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            aria-label="Decrease quantity">
            <svg
              className="w-3.5 h-3.5"
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
          <span className="w-8 text-center text-xs font-bold text-slate-700 border-x border-slate-200 py-1">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrease(item._id)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            aria-label="Increase quantity">
            <svg
              className="w-3.5 h-3.5"
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

        {/* Remove */}
        <button
          onClick={() => onRemove(item._id)}
          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          Remove
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   Cart Page
══════════════════════════════════════════ */
const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null); // itemId currently being updated
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get("/cart");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.cart || [];
      setCartItems(data);
    } catch (err) {
      setError("Failed to load cart. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Increase quantity
  const handleIncrease = async (itemId) => {
    setUpdating(itemId);
    try {
      const res = await api.put(`/cart/${itemId}`, { action: "increase" });
      const updated = res.data.item || res.data;
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, quantity: updated.quantity ?? item.quantity + 1 }
            : item
        )
      );
    } catch {
      setToast({ message: "Failed to update quantity.", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  // ── Decrease quantity (remove if reaches 0)
  const handleDecrease = async (itemId, currentQty) => {
    if (currentQty <= 1) {
      return handleRemove(itemId);
    }
    setUpdating(itemId);
    try {
      const res = await api.put(`/cart/${itemId}`, { action: "decrease" });
      const updated = res.data.item || res.data;
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, quantity: updated.quantity ?? currentQty - 1 }
            : item
        )
      );
    } catch {
      setToast({ message: "Failed to update quantity.", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  // ── Remove item
  const handleRemove = async (itemId) => {
    setUpdating(itemId);
    try {
      await api.delete(`/cart/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      setToast({ message: "Item removed from cart.", type: "success" });
    } catch {
      setToast({ message: "Failed to remove item.", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  // ── Place Order
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await api.post("/orders");
      navigate("/customer/orders", { state: { orderSuccess: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      setToast({ message: msg, type: "error" });
    } finally {
      setPlacing(false);
    }
  };

  // ── Totals
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.productId?.price || item.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ── Render
  if (!user) return null;
  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Cart
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {cartItems.length === 0
                ? "No items"
                : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 transition-colors">
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
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {cartItems.length === 0 && !loading ? (
        <EmptyCart />
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Cart Items List ── */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                    updating={updating}
                  />
                ))}
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-24 flex flex-col gap-5">
                <h2 className="text-base font-black text-slate-900">
                  Order Summary
                </h2>

                {/* Line items */}
                <div className="space-y-2.5 text-sm">
                  {cartItems.map((item) => {
                    const price = parseFloat(
                      item.productId?.price || item.price || 0
                    );
                    const name = item.productId?.name || item.name || "Product";
                    return (
                      <div
                        key={item._id}
                        className="flex justify-between text-slate-600 gap-2">
                        <span className="truncate">
                          {name}
                          <span className="text-slate-400 ml-1">
                            ×{item.quantity}
                          </span>
                        </span>
                        <span className="font-semibold text-slate-800 shrink-0">
                          ${(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-xl font-black text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Place Order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
                  {placing ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth={4}
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Secure checkout. No hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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

export default Cart;
