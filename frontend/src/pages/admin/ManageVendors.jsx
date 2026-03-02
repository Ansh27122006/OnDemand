import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

/* ── Status Badge ── */
const StatusBadge = ({ isApproved }) =>
  isApproved ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 text-xs font-bold rounded-full">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      Approved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold rounded-full">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
      Pending
    </span>
  );

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
const tabs = ["All", "Pending", "Approved"];

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

/* ══════════════════════════════════════════
   ManageVendors Page
══════════════════════════════════════════ */
const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [actioningId, setActioningId] = useState(null);
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
        prev.map((v) => (v._id === id ? { ...v, isApproved: true } : v))
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
        prev.map((v) => (v._id === id ? { ...v, isApproved: false } : v))
      );
      setToast({ message: "Vendor rejected successfully.", type: "success" });
    } catch {
      setToast({ message: "Failed to reject vendor.", type: "error" });
    } finally {
      setActioningId(null);
    }
  };

  // ── Tab counts
  const counts = useMemo(
    () => ({
      All: vendors.length,
      Pending: vendors.filter((v) => !v.isApproved).length,
      Approved: vendors.filter((v) => v.isApproved).length,
    }),
    [vendors]
  );

  // ── Filtered vendors
  const filteredVendors = useMemo(() => {
    if (activeTab === "Pending") return vendors.filter((v) => !v.isApproved);
    if (activeTab === "Approved") return vendors.filter((v) => v.isApproved);
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
                          <StatusBadge isApproved={vendor.isApproved} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {!vendor.isApproved ? (
                            <button
                              onClick={() => handleApprove(vendor._id)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                              {isActioning ? (
                                <svg
                                  className="animate-spin w-3.5 h-3.5"
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
                                  className="w-3.5 h-3.5"
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
                              )}
                              Approve
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReject(vendor._id)}
                              disabled={isActioning}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors">
                              {isActioning ? (
                                <svg
                                  className="animate-spin w-3.5 h-3.5"
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
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              )}
                              Reject
                            </button>
                          )}
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

export default ManageVendors;
