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

/* ── Return request status badge ── */
const returnStatusConfig = {
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    badge: "bg-green-50 text-green-600 border-green-100",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-600 border-red-100",
    dot: "bg-red-500",
  },
};

const ReturnStatusBadge = ({ status }) => {
  const cfg = returnStatusConfig[status?.toLowerCase()] || returnStatusConfig.pending;
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        )}
      </svg>
    </div>
    {message}
    <button
      onClick={onClose}
      className="ml-2 text-white/60 hover:text-white transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

/* ── Reject Note Modal ── */
const RejectModal = ({ returnRequest, onClose, onConfirm, loading }) => {
  const [vendorNote, setVendorNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reject Return Request</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono tracking-widest">
              #{(returnRequest.orderId?._id || returnRequest.orderId || "").slice(0, 8).toUpperCase()}
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
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Reason for Rejection <span className="text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              rows={3}
              placeholder="Explain why this return is being rejected…"
              value={vendorNote}
              onChange={(e) => setVendorNote(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(vendorNote)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2">
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Returns Empty State ── */
const ReturnsEmptyState = () => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <p className="text-slate-600 font-bold text-sm">No return requests</p>
        <p className="text-slate-400 text-xs">Return requests from customers will appear here.</p>
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

  // ── Return requests state
  const [returnRequests, setReturnRequests] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("orders"); // "orders" | "returns"
  const [rejectModal, setRejectModal] = useState(null); // returnRequest object
  const [returnActionLoading, setReturnActionLoading] = useState(null); // id being actioned

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

  // Fetch return requests
  useEffect(() => {
    api.get("/returns/vendor")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.returns || [];
        setReturnRequests(data);
      })
      .catch(() => {
        // Non-critical — don't block the page
      })
      .finally(() => setReturnsLoading(false));
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
      setToast({ message: `Order status updated to "${newStatus}".`, type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update status.";
      setToast({ message: msg, type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Get available status transitions
  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = ["pending", "confirmed", "delivered"];
    
    // Once delivered, no transitions allowed
    if (currentStatus === "delivered") {
      return [];
    }
    
    // Once confirmed, can only go to delivered (not back to pending)
    if (currentStatus === "confirmed") {
      return ["delivered"];
    }
    
    // From pending, show available transitions
    return allStatuses.filter(s => s !== currentStatus);
  };

  // ── Handle return approve/reject
  const handleReturnAction = async (returnId, status, vendorNote = "") => {
    setReturnActionLoading(returnId);
    try {
      await api.put(`/returns/${returnId}/status`, { status, vendorNote });
      // Refresh return requests list
      const res = await api.get("/returns/vendor");
      const data = Array.isArray(res.data) ? res.data : res.data.returns || [];
      setReturnRequests(data);
      setToast({ message: `Return request ${status}.`, type: "success" });
      setRejectModal(null);
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${status} return.`;
      setToast({ message: msg, type: "error" });
    } finally {
      setReturnActionLoading(null);
    }
  };

  // ── Tab counts
  const counts = useMemo(
    () => ({
      All: orders.length,
      Pending: orders.filter((o) => o.status?.toLowerCase() === "pending").length,
      Confirmed: orders.filter((o) => o.status?.toLowerCase() === "confirmed").length,
      Delivered: orders.filter((o) => o.status?.toLowerCase() === "delivered").length,
    }),
    [orders]
  );

  const pendingReturnsCount = useMemo(
    () => returnRequests.filter((r) => r.status?.toLowerCase() === "pending").length,
    [returnRequests]
  );

  // ── Filtered orders
  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter((o) => o.status?.toLowerCase() === activeTab.toLowerCase());
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
                <span className="text-amber-500 font-semibold">{counts.Pending} pending</span>
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
                  .reduce((sum, o) => sum + parseFloat(o.totalAmount || o.total || 0), 0)
                  .toFixed(2)}{" "}
                <span className="font-normal text-blue-500">delivered revenue</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Section switcher ── */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-fit">
          <button
            onClick={() => setActiveSection("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              activeSection === "orders"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeSection === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection("returns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              activeSection === "returns"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Return Requests
            {pendingReturnsCount > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeSection === "returns" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"}`}>
                {pendingReturnsCount}
              </span>
            )}
          </button>
        </div>

        {/* ══ ORDERS SECTION ══ */}
        {activeSection === "orders" && (
          <>
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
                      activeTab === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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
                      {["Order ID", "Customer", "Items", "Total", "Status", "Update Status"].map((h) => (
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
                        const customer = order.customerId?.name || order.customerId?.email || "Unknown";
                        const items = order.items || [];
                        const total = parseFloat(order.totalAmount || order.total || 0).toFixed(2);
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
                            className={`hover:bg-slate-50 transition-colors ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                            {/* Order ID + date */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="font-black text-slate-800 font-mono text-xs tracking-wider">#{orderId}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{orderDate}</p>
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                                  {customer.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700">{customer}</span>
                              </div>
                            </td>

                            {/* Items */}
                            <td className="px-5 py-4 max-w-[220px]">
                              <ul className="space-y-0.5">
                                {items.slice(0, 2).map((item, idx) => {
                                  const name = item.productId?.name || item.name || "Product";
                                  return (
                                    <li key={idx} className="text-xs text-slate-600 truncate">
                                      <span className="font-semibold text-slate-800">{item.quantity}×</span> {name}
                                    </li>
                                  );
                                })}
                                {items.length > 2 && (
                                  <li className="text-xs text-slate-400">+{items.length - 2} more</li>
                                )}
                              </ul>
                            </td>

                            {/* Total */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="font-black text-slate-800">₹{total}</span>
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
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  disabled={updatingId === order._id || getAvailableStatuses(order.status).length === 0}
                                  className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                  <option value={order.status?.toLowerCase()}>{order.status || "Pending"}</option>
                                  {getAvailableStatuses(order.status).map((status) => (
                                    <option key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                {updatingId === order._id ? (
                                  <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin w-3.5 h-3.5 text-blue-500 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                ) : (
                                  <svg
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
          </>
        )}

        {/* ══ RETURN REQUESTS SECTION ══ */}
        {activeSection === "returns" && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Return Requests</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {returnRequests.length} total · {pendingReturnsCount} pending review
                </p>
              </div>
              {pendingReturnsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border bg-amber-50 text-amber-600 border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {pendingReturnsCount} awaiting action
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              {returnsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Order ID", "Customer", "Return Reason", "Requested On", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnRequests.length === 0 ? (
                      <ReturnsEmptyState />
                    ) : (
                      returnRequests.map((req) => {
                        const orderId = (req.orderId?._id || req.orderId || "").slice(0, 8).toUpperCase() || "—";
                        const customer =
                          req.customerId?.name ||
                          req.customerId?.email ||
                          req.orderId?.customerId?.name ||
                          req.orderId?.customerId?.email ||
                          "Unknown";
                        const requestDate = req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—";
                        const isPending = req.status?.toLowerCase() === "pending";
                        const isActioning = returnActionLoading === req._id;

                        return (
                          <tr
                            key={req._id}
                            className={`hover:bg-slate-50 transition-colors ${isActioning ? "opacity-50 pointer-events-none" : ""}`}>
                            {/* Order ID */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <p className="font-black text-slate-800 font-mono text-xs tracking-wider">#{orderId}</p>
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                                  {customer.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700">{customer}</span>
                              </div>
                            </td>

                            {/* Return Reason */}
                            <td className="px-5 py-4 max-w-[240px]">
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {req.reason || "—"}
                              </p>
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-xs text-slate-500">{requestDate}</span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <ReturnStatusBadge status={req.status} />
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleReturnAction(req._id, "approved")}
                                    disabled={isActioning}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                                    {isActioning ? (
                                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectModal(req)}
                                    disabled={isActioning}
                                    className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No actions</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <RejectModal
          returnRequest={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(vendorNote) => handleReturnAction(rejectModal._id, "rejected", vendorNote)}
          loading={returnActionLoading === rejectModal._id}
        />
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

export default ManageOrders;