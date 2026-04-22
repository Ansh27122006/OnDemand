import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const shortId = (id) => (id ? `#${String(id).slice(0, 8).toUpperCase()}` : "—");

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-11 h-11 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading order details…</p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl">⚠️</div>
    <div>
      <p className="font-bold text-slate-700 text-lg">Could not load order</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
    </div>
    <Link to="/customer/orders" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
      ← Back to Orders
    </Link>
  </div>
);

// ─── Status Timeline ──────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    description: "Your order has been received and is being processed.",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    key: "confirmed",
    label: "Order Confirmed",
    description: "The vendor has confirmed your order and is preparing it.",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered successfully. Enjoy!",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

// step state: 'completed' | 'current' | 'upcoming'
const getStepState = (stepKey, status) => {
  if (stepKey === "placed") return "completed";
  if (stepKey === "confirmed") {
    if (status === "confirmed" || status === "delivered") return "completed";
    if (status === "pending") return "current";
    return "upcoming";
  }
  if (stepKey === "delivered") {
    if (status === "delivered") return "completed";
    if (status === "confirmed") return "current";
    return "upcoming";
  }
  return "upcoming";
};

const TimelineStep = ({ step, state, date, isLast }) => {
  const isCompleted = state === "completed";
  const isCurrent = state === "current";

  return (
    <div className="flex gap-4">
      {/* Left: circle + line */}
      <div className="flex flex-col items-center">
        {/* Circle */}
        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300 ${
          isCompleted
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
            : isCurrent
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "bg-white border-2 border-slate-200 text-slate-300"
        }`}>
          {/* Pulse ring for current step */}
          {isCurrent && (
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
          )}
          {isCompleted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            step.icon
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-[2.5rem] transition-colors duration-300 ${
            isCompleted ? "bg-emerald-400" : "bg-slate-200"
          }`} />
        )}
      </div>

      {/* Right: content */}
      <div className={`pb-8 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className={`font-bold text-sm leading-tight ${
              isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-700" : "text-slate-400"
            }`}>
              {step.label}
            </h3>
            <p className={`text-xs mt-0.5 leading-relaxed ${
              isCompleted || isCurrent ? "text-slate-500" : "text-slate-300"
            }`}>
              {step.description}
            </p>
          </div>
          {date && isCompleted && (
            <span className="text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              {date}
            </span>
          )}
          {isCurrent && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              In progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${colors[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order || res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Order not found");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!order) return null;

  const items = order.items || [];
  const storeName =
    order.vendorId?.storeName ||
    order.vendor?.storeName ||
    order.storeName ||
    "Unknown Store";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/customer/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Page Heading ── */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Order {shortId(order._id)}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ══════════════════════════════════
              SECTION 1 — Order Summary
          ══════════════════════════════════ */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  </span>
                  Order Summary
                </h2>
              </div>

              {/* Meta info */}
              <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-slate-50 bg-slate-50/50">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Order ID</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{shortId(order._id)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Store</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{storeName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Items</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Items list */}
              <div className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-slate-400 text-center">No items found</p>
                ) : (
                  items.map((item, i) => {
                    const name = item.productId?.name || item.name || "Product";
                    const price = item.productId?.price ?? item.price ?? 0;
                    const qty = item.quantity || 1;
                    return (
                      <div key={item._id || i} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {/* Product icon */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 text-base">
                            📦
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatCurrency(price)} × {qty}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-700 shrink-0">
                          {formatCurrency(price * qty)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Total Amount</span>
                <span className="text-xl font-extrabold text-blue-600">
                  {formatCurrency(order.totalAmount ?? order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════
              SECTION 2 — Status Timeline
          ══════════════════════════════════ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </span>
                  Order Status
                </h2>
              </div>

              {/* Timeline */}
              <div className="px-6 py-6">
                {STEPS.map((step, i) => {
                  const state = getStepState(step.key, order.status);
                  const isLast = i === STEPS.length - 1;
                  // Show date for placed step
                  const date =
                    step.key === "placed"
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : step.key === "confirmed" && (order.status === "confirmed" || order.status === "delivered")
                      ? new Date(order.updatedAt || order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : step.key === "delivered" && order.status === "delivered"
                      ? new Date(order.updatedAt || order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : null;

                  return (
                    <TimelineStep
                      key={step.key}
                      step={step}
                      state={state}
                      date={date}
                      isLast={isLast}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
