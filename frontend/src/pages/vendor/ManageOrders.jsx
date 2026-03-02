import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

/* ── Status config ── */
const statusConfig = {
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-50 text-blue-600 border-blue-100",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    badge: "bg-green-50 text-green-600 border-green-100",
    dot: "bg-green-500 animate-pulse",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || {
    label: status || "Unknown",
    badge: "bg-slate-50 text-slate-500 border-slate-100",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
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

/* ── Filter tabs ── */
const tabs = ["All", "Pending", "Confirmed", "Delivered"];

/* ── Empty State ── */
const EmptyState = ({ filter }) => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-slate-300"
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
        <p className="text-slate-600 font-bold text-sm">
          No {filter !== "All" ? filter.toLowerCase() : ""} orders
        </p>
        <p className="text-slate-400 text-xs">
          {filter === "All"
            ? "Orders from customers will appear here."
            : `No orders with status "${filter.toLowerCase()}" yet.`}
        </p>
      </div>
    </td>
  </tr>
);

/* ══════════════════════════════════════════
   ManageOrders Page
══════════════════════════════════════════ */
const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch vendor orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/vendor");
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

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setToast({
        message: `Order status updated to "${newStatus}".`,
        type: "success",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update status.";
      setToast({ message: msg, type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Tab counts
  const counts = useMemo(
    () => ({
      All: orders.length,
      Pending: orders.filter((o) => o.status?.toLowerCase() === "pending")
        .length,
      Confirmed: orders.filter((o) => o.status?.toLowerCase() === "confirmed")
        .length,
      Delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered")
        .length,
    }),
    [orders]
  );

  // ── Filtered orders
  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter(
      (o) => o.status?.toLowerCase() === activeTab.toLowerCase()
    );
  }, [orders, activeTab]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Manage Orders
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {orders.length} total order{orders.length !== 1 ? "s" : ""} ·{" "}
                <span className="text-amber-500 font-semibold">
                  {counts.Pending} pending
                </span>
              </p>
            </div>
            {/* Revenue summary */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
              <svg
                className="w-4 h-4 text-blue-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-bold text-blue-700">
                ₹
                {orders
                  .filter((o) => o.status?.toLowerCase() === "delivered")
                  .reduce(
                    (sum, o) => sum + parseFloat(o.totalAmount || o.total || 0),
                    0
                  )
                  .toFixed(2)}{" "}
                <span className="font-normal text-blue-500">
                  delivered revenue
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}>
              {tab}
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Order ID",
                    "Customer",
                    "Items",
                    "Total",
                    "Status",
                    "Update Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <EmptyState filter={activeTab} />
                ) : (
                  filteredOrders.map((order) => {
                    const orderId = order._id?.slice(0, 8).toUpperCase() || "—";
                    const customer =
                      order.userId?.name || order.customerName || "Unknown";
                    const items = order.items || [];
                    const total = parseFloat(
                      order.totalAmount || order.total || 0
                    ).toFixed(2);
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";
                    const isUpdating = updatingId === order._id;

                    return (
                      <tr
                        key={order._id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isUpdating ? "opacity-50 pointer-events-none" : ""
                        }`}>
                        {/* Order ID + date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-black text-slate-800 font-mono text-xs tracking-wider">
                            #{orderId}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {orderDate}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                              {customer.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-700">
                              {customer}
                            </span>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4 max-w-[220px]">
                          <ul className="space-y-0.5">
                            {items.slice(0, 2).map((item, idx) => {
                              const name =
                                item.productId?.name || item.name || "Product";
                              return (
                                <li
                                  key={idx}
                                  className="text-xs text-slate-600 truncate">
                                  <span className="font-semibold text-slate-800">
                                    {item.quantity}×
                                  </span>{" "}
                                  {name}
                                </li>
                              );
                            })}
                            {items.length > 2 && (
                              <li className="text-xs text-slate-400">
                                +{items.length - 2} more
                              </li>
                            )}
                          </ul>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-black text-slate-800">
                            ${total}
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Status dropdown */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="relative flex items-center gap-2">
                            <select
                              value={order.status?.toLowerCase() || "pending"}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={isUpdating}
                              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition shadow-sm disabled:opacity-50">
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                            </select>
                            {/* Chevron */}
                            {isUpdating ? (
                              <svg
                                className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin w-3.5 h-3.5 text-blue-500 pointer-events-none"
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
                            ) : (
                              <svg
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
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
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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

export default ManageOrders;
