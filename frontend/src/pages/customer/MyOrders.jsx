import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";

/* ── Status badge config ── */
const statusConfig = {
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-blue-50 text-blue-600 border-blue-100",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    classes: "bg-indigo-50 text-indigo-600 border-indigo-100",
    dot: "bg-indigo-500",
  },
  shipped: {
    label: "Shipped",
    classes: "bg-sky-50 text-sky-600 border-sky-100",
    dot: "bg-sky-500",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-green-50 text-green-600 border-green-100",
    dot: "bg-green-500 animate-pulse",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || {
    label: status || "Unknown",
    classes: "bg-slate-50 text-slate-500 border-slate-100",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ── Spinner ── */
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading your orders...</p>
  </div>
);

/* ── Empty State ── */
const EmptyOrders = () => (
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
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    </div>
    <div>
      <p className="text-xl font-black text-slate-800">No orders yet</p>
      <p className="text-slate-400 text-sm mt-2 max-w-xs">
        When you place your first order, it'll show up here so you can track its
        progress.
      </p>
    </div>
    <Link
      to="/products"
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
      Start Shopping
    </Link>
  </div>
);

/* ── Order Card ── */
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const orderId = order._id?.slice(0, 8).toUpperCase() || "—";
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const storeName =
    order.vendorId?.storeName || order.storeName || "Unknown Vendor";
  const items = order.items || [];
  const total = parseFloat(order.totalAmount || order.total || 0).toFixed(2);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Order ID */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Order
            </span>
            <span className="text-sm font-black text-slate-800">
              #{orderId}
            </span>
          </div>
          <span className="hidden sm:block text-slate-200">|</span>
          {/* Vendor */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-slate-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35"
              />
            </svg>
            <span className="text-sm text-slate-600 font-semibold">
              {storeName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={order.status} />
          <span className="text-xs text-slate-400">{orderDate}</span>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 py-4">
        {/* Always show first 2 items */}
        <ul className="space-y-2">
          {(expanded ? items : items.slice(0, 2)).map((item, idx) => {
            const name = item.productId?.name || item.name || "Product";
            const price = parseFloat(item.price || item.productId?.price || 0);
            const quantity = item.quantity || 1;
            const image = item.productId?.images?.[0] || item.productId?.image;

            return (
              <li
                key={idx}
                className="flex items-center gap-3">
                {/* Thumbnail */}
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">
                    {name}
                  </p>
                  <p className="text-xs text-slate-400">Qty: {quantity}</p>
                </div>
                <span className="text-sm font-bold text-slate-700 shrink-0">
                  ${(price * quantity).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Show more / less toggle */}
        {items.length > 2 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
            {expanded ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                Show less
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                +{items.length - 2} more item{items.length - 2 !== 1 ? "s" : ""}
              </>
            )}
          </button>
        )}
      </div>

      {/* Card Footer — total */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">
          {items.reduce((s, i) => s + (i.quantity || 1), 0)} item
          {items.reduce((s, i) => s + (i.quantity || 1), 0) !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium">
            Order Total:
          </span>
          <span className="text-base font-black text-blue-600">${total}</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MyOrders Page
══════════════════════════════════════════ */
const MyOrders = () => {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Show success banner if navigated from Cart after placing order
  const [showSuccess, setShowSuccess] = useState(
    !!location.state?.orderSuccess
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my");
        const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Auto-dismiss success banner
  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {loading
                ? "Loading..."
                : `${orders.length} order${
                    orders.length !== 1 ? "s" : ""
                  } placed`}
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            Shop More
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* ── Order placed success banner ── */}
        {showSuccess && (
          <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-2xl animate-slide-up">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">
                Order placed successfully!
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Your order is being processed. You'll be notified once it's
                confirmed.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-400 hover:text-green-600 transition-colors">
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
        )}

        {/* ── Error ── */}
        {error && (
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
        )}

        {/* ── Content ── */}
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
            />
          ))
        )}
      </div>

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

export default MyOrders;
