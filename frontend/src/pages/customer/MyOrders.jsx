import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const shortId = (id = "") => `#${id.slice(0, 8).toUpperCase()}`;

const STATUS_MAP = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
    dot: "bg-yellow-400",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-green-100 text-green-700 ring-1 ring-green-300",
    dot: "bg-green-500",
  },
  returned: {
    label: "Returned",
    classes: "bg-slate-100 text-slate-500 ring-1 ring-slate-300",
    dot: "bg-slate-400",
  },
};

// ── Return Request Modal ──────────────────────────────────────────────────────

function ReturnModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for the return.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await axios.post("/returns", { orderId: order._id, reason: reason.trim() });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess(order._id);
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Failed to submit return request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeSlideUp_0.2s_ease]">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Request a Return</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono tracking-widest">
              {shortId(order._id)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-4">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-800">Return request submitted!</p>
              <p className="text-xs text-slate-400">We'll review your request shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Reason for Return <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  rows={4}
                  placeholder="Describe why you'd like to return this order…"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError(null); }}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal footer */}
        {!submitted && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
              {submitting && (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function OrderCard({ order, index, returnedOrderIds, returnRequestsMap, onRequestReturn }) {
  const storeName = order.vendorId?.storeName ?? "Unknown Store";
  const items = order.items ?? [];

  const returnRequest = returnRequestsMap?.get(order._id);
  const hasReturnRequest = !!returnRequest;
  const isReturnApproved = returnRequest?.status === "approved";
  const isReturned = order.status === "returned" || isReturnApproved;
  const isDelivered = order.status === "delivered";

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div>
          <span className="font-mono text-sm font-bold text-slate-800 tracking-widest">
            {shortId(order._id)}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Vendor store */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
              <polyline
                strokeLinecap="round"
                strokeLinejoin="round"
                points="9 22 9 12 15 12 15 22"
              />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
              Store
            </p>
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {storeName}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-slate-100" />

        {/* Items */}
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">
            Items
          </p>
          <ul className="space-y-1.5">
            {items.map((item, i) => {
              const name = item.productId?.name ?? item.name ?? "Product";
              return (
                <li
                  key={i}
                  className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                    <span className="text-sm text-slate-600 truncate">
                      {name}
                    </span>
                  </div>
                  <span className="ml-3 shrink-0 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    ×{item.quantity}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-900">
            Rs. {order.totalAmount}
          </span>

          {/* ── Return section ── */}
          {isReturned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Returned
            </span>
          ) : hasReturnRequest ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Return Requested
            </span>
          ) : isDelivered ? (
            <button
              onClick={() => onRequestReturn(order)}
              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Request Return
            </button>
          ) : null}

          <Link
            to={`/customer/orders/${order._id}`}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-400">Loading your orders…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-6 text-center px-4">
      <div className="relative">
        <div className="w-28 h-28 rounded-3xl bg-indigo-50 flex items-center justify-center">
          <svg
            className="w-14 h-14 text-indigo-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">0</span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-800">No orders yet</h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          You haven't placed any orders. Start exploring products from our
          vendors!
        </p>
      </div>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all duration-150">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Browse Products
      </Link>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-5 py-4">
      <svg
        className="w-4 h-4 shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Return request state — Map of orderId -> return request object
  const [returnRequestsMap, setReturnRequestsMap] = useState(new Map());
  const [activeReturnOrder, setActiveReturnOrder] = useState(null); // order object for modal

  useEffect(() => {
    // Fetch orders and existing return requests in parallel
    Promise.all([
      axios.get("/orders/my"),
      axios.get("/returns/my"),
    ])
      .then(([ordersRes, returnsRes]) => {
        // Orders
        const data = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);

        // Build a Map of orderId -> return request object
        const returnsData = Array.isArray(returnsRes.data) ? returnsRes.data : [];
        const map = new Map(
          returnsData.map((r) => {
            const orderId = r.orderId?._id ?? r.orderId ?? r.order ?? "";
            return [orderId, r];
          })
        );
        setReturnRequestsMap(map);
      })
      .catch(() => setError("Failed to load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // Called when modal submits successfully
  const handleReturnSuccess = (orderId) => {
    setReturnRequestsMap((prev) => {
      const next = new Map(prev);
      next.set(orderId, { status: "pending" });
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Orders
            </h1>
            {!loading && !error && (
              <p className="text-xs text-slate-400 mt-0.5">
                {orders.length > 0
                  ? `${orders.length} order${
                      orders.length !== 1 ? "s" : ""
                    } placed`
                  : "No orders yet"}
              </p>
            )}
          </div>
          {!loading && !error && orders.length > 0 && (
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-sm shadow-indigo-300">
              {orders.length}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {loading && <Spinner />}
        {!loading && error && <ErrorBanner message={error} />}
        {!loading && !error && orders.length === 0 && <EmptyState />}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order, i) => (
              <OrderCard
                key={order._id}
                order={order}
                index={i}
                returnRequestsMap={returnRequestsMap}
                onRequestReturn={setActiveReturnOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Return modal */}
      {activeReturnOrder && (
        <ReturnModal
          order={activeReturnOrder}
          onClose={() => setActiveReturnOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}