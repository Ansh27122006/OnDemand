import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

// ── Status config ──────────────────────────────────────────────────────────────
const statusConfig = {
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

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ── Filter tabs ────────────────────────────────────────────────────────────────
const TABS = ["All", "Pending", "Approved", "Rejected"];

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyState = ({ filter, query }) => (
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
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-bold text-sm">No return requests found</p>
        <p className="text-slate-400 text-xs">
          {query
            ? `No results for "${query}". Try a different search.`
            : filter !== "All"
            ? `No ${filter.toLowerCase()} return requests yet.`
            : "Return requests from customers will appear here."}
        </p>
      </div>
    </td>
  </tr>
);

/* ══════════════════════════════════════════
   ManageReturns Page
══════════════════════════════════════════ */
const ManageReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await api.get("/returns/all");
        const data = Array.isArray(res.data) ? res.data : res.data.returns || [];
        setReturns(data);
      } catch (err) {
        setError("Failed to load return requests. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  // ── Tab counts ──
  const counts = useMemo(
    () => ({
      All: returns.length,
      Pending: returns.filter((r) => r.status?.toLowerCase() === "pending").length,
      Approved: returns.filter((r) => r.status?.toLowerCase() === "approved").length,
      Rejected: returns.filter((r) => r.status?.toLowerCase() === "rejected").length,
    }),
    [returns]
  );

  // ── Filtered + searched ──
  const filtered = useMemo(() => {
    let list = returns;

    // Filter by tab
    if (activeTab !== "All") {
      list = list.filter((r) => r.status?.toLowerCase() === activeTab.toLowerCase());
    }

    // Filter by search — customer name or order ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const customerName = (r.customerId?.name || "").toLowerCase();
        const orderId = (r.orderId?._id || r.orderId || "").toLowerCase();
        return customerName.includes(q) || orderId.includes(q);
      });
    }

    return list;
  }, [returns, activeTab, searchQuery]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Return Requests
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {returns.length} total ·{" "}
                <span className="text-amber-500 font-semibold">
                  {counts.Pending} pending
                </span>
              </p>
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

        {/* ── Filters row: tabs + search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Tab pills */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm w-fit flex-wrap">
            {TABS.map((tab) => (
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

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer or order ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Order ID", "Customer", "Vendor Store", "Reason", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <EmptyState filter={activeTab} query={searchQuery} />
                ) : (
                  filtered.map((req) => {
                    const orderId = (req.orderId?._id || req.orderId || "").slice(0, 8).toUpperCase() || "—";
                    const customer = req.customerId?.name || req.customerId?.email || "Unknown";
                    const storeName = req.vendorId?.storeName || "—";
                    const date = req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr key={req._id} className="hover:bg-slate-50 transition-colors">

                        {/* Order ID */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-black text-slate-800 font-mono text-xs tracking-wider">
                            #{orderId}
                          </span>
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

                        {/* Vendor store */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                              {storeName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-700">{storeName}</span>
                          </div>
                        </td>

                        {/* Reason (truncated) */}
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {req.reason || "—"}
                          </p>
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={req.status} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-xs text-slate-500">{date}</span>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer with result count */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                Showing {filtered.length} of {returns.length} return request{returns.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageReturns;