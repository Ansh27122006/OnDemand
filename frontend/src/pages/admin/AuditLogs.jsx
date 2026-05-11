import { useState, useEffect } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

/* ── Action Badge with colors ── */
const ActionBadge = ({ action }) => {
  const actionConfig = {
    APPROVE_VENDOR: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
      dot: "bg-green-500",
      label: "Approve Vendor",
    },
    REJECT_VENDOR: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-100",
      dot: "bg-red-500",
      label: "Reject Vendor",
    },
    DELETE_USER: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      dot: "bg-orange-500",
      label: "Delete User",
    },
    DELETE_PRODUCT: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      dot: "bg-purple-500",
      label: "Delete Product",
    },
    DELETE_SERVICE: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      dot: "bg-blue-500",
      label: "Delete Service",
    },
  };

  const config = actionConfig[action] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
    dot: "bg-slate-500",
    label: action,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} ${config.text} border ${config.border} text-xs font-bold rounded-full`}
    >
      <span className={`w-1.5 h-1.5 ${config.dot} rounded-full`} />
      {config.label}
    </span>
  );
};

/* ── Format date and time ── */
const formatDateTime = (date) => {
  const d = new Date(date);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

/* ── Empty State ── */
const EmptyState = () => (
  <tr>
    <td colSpan={5}>
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m-3.75-6h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008M12 12h3.75m-3.75 3h3.75m-3.75 3h3.75M9 9h.008v.008H9V9zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-bold text-sm">
          No admin activity recorded yet
        </p>
        <p className="text-slate-400 text-xs">
          Admin actions will appear here when they happen
        </p>
      </div>
    </td>
  </tr>
);

/* ── Main Component ── */
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAction, setFilterAction] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = filterAction !== "ALL" ? `?action=${filterAction}` : "";
        const response = await api.get(`/audit${query}`);

        setLogs(response.data.logs || []);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filterAction]);

  // Filter logs by search term (admin name or target name)
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.adminName.toLowerCase().includes(term) ||
      log.targetName.toLowerCase().includes(term)
    );
  });

  // Action options for dropdown
  const actionOptions = [
    { value: "ALL", label: "All Actions" },
    { value: "APPROVE_VENDOR", label: "Approve Vendor" },
    { value: "REJECT_VENDOR", label: "Reject Vendor" },
    { value: "DELETE_USER", label: "Delete User" },
    { value: "DELETE_PRODUCT", label: "Delete Product" },
    { value: "DELETE_SERVICE", label: "Delete Service" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Activity Logs
          </h1>
          <p className="text-slate-600 text-sm">
            Complete history of admin actions
          </p>
        </div>

        {/* Stats & Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Count */}
            <div className="text-sm font-semibold text-slate-700">
              Activity Log ({filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "entry" : "entries"})
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Dropdown */}
              <select
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setSearchTerm(""); // Reset search when filter changes
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by admin or target name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Admin Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {log.adminName}
                        </td>
                        <td className="px-6 py-4">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                          {log.targetName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {log.details || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
