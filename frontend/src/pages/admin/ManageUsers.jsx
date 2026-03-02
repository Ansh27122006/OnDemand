import { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

/* ── Role badge config ── */
const roleConfig = {
  customer: "bg-blue-50 text-blue-600 border-blue-100",
  vendor: "bg-violet-50 text-violet-600 border-violet-100",
  admin: "bg-red-50 text-red-600 border-red-100",
};

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${
      roleConfig[role] || "bg-slate-50 text-slate-500 border-slate-100"
    }`}>
    {role}
  </span>
);

/* ── Confirm Delete Modal ── */
const ConfirmModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      onClick={onCancel}
    />
    {/* Dialog */}
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
      {/* Icon */}
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-red-500"
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
      </div>
      <h3 className="text-base font-black text-slate-900 text-center">
        Delete User
      </h3>
      <p className="text-sm text-slate-500 text-center mt-2">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-slate-700">{user?.name}</span>? This
        action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
          {loading ? (
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
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          )}
          Delete
        </button>
      </div>
    </div>
  </div>
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

/* ── Empty State ── */
const EmptyState = ({ query }) => (
  <tr>
    <td colSpan={5}>
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
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-bold text-sm">
          {query ? `No users found for "${query}"` : "No users found"}
        </p>
        <p className="text-slate-400 text-xs">
          {query
            ? "Try a different name or email."
            : "No users have registered yet."}
        </p>
      </div>
    </td>
  </tr>
);

/* ══════════════════════════════════════════
   ManageUsers Page
══════════════════════════════════════════ */
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState(null); // user object pending deletion
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        setUsers(data);
      } catch (err) {
        setError("Failed to load users. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Delete confirmed
  const handleDeleteConfirm = async () => {
    if (!confirmUser) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${confirmUser._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== confirmUser._id));
      setToast({
        message: `${confirmUser.name} has been deleted.`,
        type: "success",
      });
      setConfirmUser(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete user.";
      setToast({ message: msg, type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter by name or email
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // ── Role breakdown for header
  const roleCounts = useMemo(
    () => ({
      customer: users.filter((u) => u.role === "customer").length,
      vendor: users.filter((u) => u.role === "vendor").length,
      admin: users.filter((u) => u.role === "admin").length,
    }),
    [users]
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Manage Users
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {users.length} total user{users.length !== 1 ? "s" : ""}
              </p>
            </div>
            {/* Role breakdown pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                {
                  role: "customer",
                  count: roleCounts.customer,
                  classes: "bg-blue-50 text-blue-600 border-blue-100",
                },
                {
                  role: "vendor",
                  count: roleCounts.vendor,
                  classes: "bg-violet-50 text-violet-600 border-violet-100",
                },
                {
                  role: "admin",
                  count: roleCounts.admin,
                  classes: "bg-red-50 text-red-600 border-red-100",
                },
              ].map(({ role, count, classes }) => (
                <span
                  key={role}
                  className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${classes}`}>
                  {count} {role}
                  {count !== 1 ? "s" : ""}
                </span>
              ))}
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

        {/* ── Search Bar ── */}
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
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
          )}
        </div>

        {/* ── Results count when searching ── */}
        {searchQuery && (
          <p className="text-sm text-slate-500">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}{" "}
            for{" "}
            <span className="font-semibold text-slate-700">
              "{searchQuery}"
            </span>
          </p>
        )}

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <EmptyState query={searchQuery} />
                ) : (
                  filteredUsers.map((user) => {
                    const joinedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    // Avatar initials
                    const initials =
                      user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "?";

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-slate-50 transition-colors">
                        {/* Name + Avatar */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {user.name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {user.email || "—"}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">
                          {joinedDate}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {user.role !== "admin" ? (
                            <button
                              onClick={() => setConfirmUser(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all duration-150">
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
                              Delete
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium px-3 py-1.5 inline-block">
                              Protected
                            </span>
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

      {/* ── Confirm Delete Modal ── */}
      {confirmUser && (
        <ConfirmModal
          user={confirmUser}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setConfirmUser(null)}
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
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up  { animation: slide-up  0.25s ease-out both; }
        .animate-scale-in  { animation: scale-in  0.2s  ease-out both; }
      `}</style>
    </div>
  );
};

export default ManageUsers;
