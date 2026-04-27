import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"; // ← added useNavigate
import api from "../../api/axios";
import Loader from "../../components/Loader";

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      dot: "bg-amber-500",
      label: "Pending",
    },
    approved: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      dot: "bg-green-500",
      label: "Approved",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      dot: "bg-red-500",
      label: "Rejected",
    },
    blocked: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-500",
      label: "Blocked",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} border ${config.border} text-xs font-bold rounded-full`}>
      <span className={`w-1.5 h-1.5 ${config.dot} rounded-full ${status === "approved" ? "animate-pulse" : ""}`} />
      {config.label}
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

/* ── Filter Tabs ── */
const tabs = ["All", "Pending", "Approved", "Rejected", "Blocked"];

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
              d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-bold text-sm">
          No {filter !== "All" ? filter.toLowerCase() : ""} vendors found
        </p>
        <p className="text-slate-400 text-xs">
          {filter === "Pending"
            ? "All vendor applications have been reviewed."
            : "No vendors have registered yet."}
        </p>
      </div>
    </td>
  </tr>
);

/* ── Profile Modal ── */
const ProfileModal = ({ vendor, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {vendor.logo ? (
            <img
              src={vendor.logo}
              alt={vendor.storeName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
          )}
          <div>
            <h3 className="text-base font-black text-white">
              {vendor.storeName}
            </h3>
            <StatusBadge status={vendor.status || (vendor.isApproved ? "approved" : "pending")} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-xl leading-none transition-colors">
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Owner info */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Owner Info
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-semibold text-slate-800">
              {vendor.userId?.name || "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-semibold text-slate-800">
              {vendor.userId?.email || "—"}
            </span>
          </div>
        </div>

        {/* Store info */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Store Info
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Category</span>
            <span className="font-semibold text-slate-800">
              {vendor.category || "—"}
            </span>
          </div>
          {vendor.contact && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Contact</span>
              <span className="font-semibold text-slate-800">
                {vendor.contact}
              </span>
            </div>
          )}
          {vendor.location && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Location</span>
              <span className="font-semibold text-slate-800 text-right max-w-[60%]">
                {vendor.location}
              </span>
            </div>
          )}
          {vendor.description && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {vendor.description}
              </p>
            </div>
          )}
        </div>

        {/* Block Info */}
        {vendor.status === "blocked" && vendor.blockedUntil && (
          <div className="bg-slate-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Block Status
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Blocked Until</span>
              <span className="font-semibold text-slate-800">
                {new Date(vendor.blockedUntil).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {vendor.blockReason && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Reason</p>
                <p className="text-sm text-slate-700">{vendor.blockReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Registered date */}
        {vendor.createdAt && (
          <p className="text-xs text-slate-400 text-center">
            Registered on{" "}
            {new Date(vendor.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>
);

/* ── Block Modal ── */
const BlockModal = ({ vendor, onClose, onBlock }) => {
  const [blockedUntil, setBlockedUntil] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blockedUntil) {
      return;
    }
    setIsLoading(true);
    await onBlock(vendor._id, blockedUntil, blockReason);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 flex items-center justify-between">
          <h3 className="text-base font-black text-white">Block Vendor</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-2">
              Vendor: <span className="font-semibold text-slate-800">{vendor.storeName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Block Until *
            </label>
            <input
              type="date"
              value={blockedUntil}
              min={today}
              onChange={(e) => setBlockedUntil(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Why are you blocking this vendor?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !blockedUntil}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Blocking...
                </>
              ) : (
                "Block Vendor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ManageVendors Page
══════════════════════════════════════════ */
const ManageVendors = () => {
  const navigate = useNavigate(); // ← added

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [actioningId, setActioningId] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [blockingVendor, setBlockingVendor] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchVendors = async () => {
    try {
      const res = await api.get("/admin/vendors");
      const data = Array.isArray(res.data) ? res.data : res.data.vendors || [];
      setVendors(data);
    } catch (err) {
      setError("Failed to load vendors. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Approve vendor
  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/admin/vendors/${id}/approve`);
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isApproved: true, status: "approved" } : v))
      );
      setToast({ message: "Vendor approved successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to approve vendor.", type: "error" });
    } finally {
      setActioningId(null);
    }
  };

  // ── Reject vendor
  const handleReject = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/admin/vendors/${id}/reject`);
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isApproved: false, status: "rejected" } : v))
      );
      setToast({ message: "Vendor rejected successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to reject vendor.", type: "error" });
    } finally {
      setActioningId(null);
    }
  };

  // ── Block vendor
  const handleBlock = async (id, blockedUntil, blockReason) => {
    setActioningId(id);
    try {
      await api.put(`/admin/vendors/${id}/block`, { blockedUntil, blockReason });
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: "blocked", blockedUntil, blockReason } : v))
      );
      setToast({ message: "Vendor blocked successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to block vendor.", type: "error" });
    } finally {
      setActioningId(null);
    }
  };

  // ── Unblock vendor
  const handleUnblock = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/admin/vendors/${id}/unblock`);
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: "approved", blockedUntil: null, blockReason: "" } : v))
      );
      setToast({ message: "Vendor unblocked successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to unblock vendor.", type: "error" });
    } finally {
      setActioningId(null);
    }
  };

  // ── Tab counts
  const counts = useMemo(
    () => ({
      All: vendors.length,
      Pending: vendors.filter((v) => v.status === "pending" || (!v.status && !v.isApproved)).length,
      Approved: vendors.filter((v) => v.status === "approved" || (!v.status && v.isApproved)).length,
      Rejected: vendors.filter((v) => v.status === "rejected").length,
      Blocked: vendors.filter((v) => v.status === "blocked").length,
    }),
    [vendors]
  );

  // ── Filtered vendors
  const filteredVendors = useMemo(() => {
    if (activeTab === "Pending") return vendors.filter((v) => v.status === "pending" || (!v.status && !v.isApproved));
    if (activeTab === "Approved") return vendors.filter((v) => v.status === "approved" || (!v.status && v.isApproved));
    if (activeTab === "Rejected") return vendors.filter((v) => v.status === "rejected");
    if (activeTab === "Blocked") return vendors.filter((v) => v.status === "blocked");
    return vendors;
  }, [vendors, activeTab]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Manage Vendors
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}{" "}
                registered ·{" "}
                <span className="text-amber-500 font-semibold">
                  {counts.Pending} pending
                </span>
              </p>
            </div>
            {counts.Pending > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm font-semibold">
                <svg
                  className="w-4 h-4"
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
                {counts.Pending} application{counts.Pending !== 1 ? "s" : ""}{" "}
                awaiting review
              </div>
            )}
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
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-fit">
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
                    "Store Name",
                    "Owner",
                    "Email",
                    "Category",
                    "Status",
                    "Actions",
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
                {filteredVendors.length === 0 ? (
                  <EmptyState filter={activeTab} />
                ) : (
                  filteredVendors.map((vendor) => {
                    const isActioning = actioningId === vendor._id;
                    return (
                      <tr
                        key={vendor._id}
                        className={`transition-colors hover:bg-slate-50 ${
                          isActioning ? "opacity-50 pointer-events-none" : ""
                        }`}>
                        {/* Store Name */}
                        <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                              <svg
                                className="w-4 h-4 text-blue-500"
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
                            </div>
                            {vendor.storeName || "—"}
                          </div>
                        </td>

                        {/* Owner name */}
                        <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                          {vendor.userId?.name || "—"}
                        </td>

                        {/* Owner email */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {vendor.userId?.email || "—"}
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {vendor.category ? (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                              {vendor.category}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={vendor.status || (vendor.isApproved ? "approved" : "pending")} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {/* View Store */}
                            <Link
                              to={`/admin/vendors/${vendor._id}/store`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-white hover:bg-slate-600 border border-slate-200 hover:border-slate-600 rounded-lg transition-all duration-150">
                              <svg
                                className="w-3.5 h-3.5"
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
                              Store
                            </Link>

                            {/* View Profile */}
                            <button
                              onClick={() => setViewingVendor(vendor)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-150">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              View
                            </button>

                            {/* ── Chat button (navigates to /chat/:vendorUserId) ── */}
                            {vendor.userId?._id && (
                              <button
                                onClick={() =>
                                  navigate(`/chat/${vendor.userId._id}`)
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all duration-150">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27C3.4 15.46 3 13.77 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                Chat
                              </button>
                            )}

                            {/* Status-based Actions */}
                            {vendor.status === "pending" || (!vendor.status && !vendor.isApproved) ? (
                              <>
                                <button
                                  onClick={() => handleApprove(vendor._id)}
                                  disabled={isActioning}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                  {isActioning ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(vendor._id)}
                                  disabled={isActioning}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                  {isActioning ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                  Reject
                                </button>
                              </>
                            ) : vendor.status === "approved" || (!vendor.status && vendor.isApproved) ? (
                              <>
                                <button
                                  onClick={() => setBlockingVendor(vendor)}
                                  disabled={isActioning}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  Block
                                </button>
                                <button
                                  onClick={() => handleReject(vendor._id)}
                                  disabled={isActioning}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                  {isActioning ? (
                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                  Reject
                                </button>
                              </>
                            ) : vendor.status === "blocked" ? (
                              <button
                                onClick={() => handleUnblock(vendor._id)}
                                disabled={isActioning}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                {isActioning ? (
                                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                                Unblock
                              </button>
                            ) : vendor.status === "rejected" ? (
                              <button
                                onClick={() => handleApprove(vendor._id)}
                                disabled={isActioning}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                                {isActioning ? (
                                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                Approve
                              </button>
                            ) : null}
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

      {/* ── Profile Modal ── */}
      {viewingVendor && (
        <ProfileModal
          vendor={viewingVendor}
          onClose={() => setViewingVendor(null)}
        />
      )}

      {/* ── Block Modal ── */}
      {blockingVendor && (
        <BlockModal
          vendor={blockingVendor}
          onClose={() => setBlockingVendor(null)}
          onBlock={handleBlock}
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

export default ManageVendors;
