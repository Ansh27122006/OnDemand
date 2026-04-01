import { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";

const formatDiscount = (c) =>
  c.discountType === "percentage"
    ? `${c.discountValue}%`
    : `Rs. ${c.discountValue} off`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const isExpired = (d) => new Date(d) < new Date();

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 min-w-72">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          t.type === "success"
            ? "bg-white border-green-200 text-green-800"
            : "bg-white border-red-200 text-red-700"
        }`}>
        <span
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
            t.type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-500"
          }`}>
          {t.type === "success" ? "✓" : "✕"}
        </span>
        <span className="flex-1 text-gray-700">{t.message}</span>
        <button
          onClick={() => remove(t.id)}
          className="text-gray-300 hover:text-gray-500 text-lg leading-none ml-1">
          ×
        </button>
      </div>
    ))}
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 border border-gray-100">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 002 2h6a2 2 0 002-2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
          />
        </svg>
      </div>
      <p className="text-center text-gray-700 font-medium mb-1">
        Delete Coupon
      </p>
      <p className="text-center text-gray-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm">
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Add Coupon Modal ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: 0,
  expiryDate: "",
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800 placeholder:text-gray-300 transition";

const InputLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
    {children}
  </label>
);

const AddCouponModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim()) return setError("Coupon code is required.");
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return setError("Discount value must be greater than 0.");
    if (form.discountType === "percentage" && Number(form.discountValue) > 100)
      return setError("Percentage discount cannot exceed 100.");
    if (!form.expiryDate) return setError("Expiry date is required.");
    if (new Date(form.expiryDate) <= new Date())
      return setError("Expiry date must be in the future.");

    setLoading(true);
    try {
      await api.post("/coupons", {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
      });
      onSuccess("Coupon created successfully!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 border border-gray-100 overflow-hidden">
        {/* Header — uses same left-border accent as page title */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-blue-600 inline-block" />
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Add New Coupon
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Fill in the details below
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-4">
          {/* Coupon Code */}
          <div>
            <InputLabel>
              Coupon Code{" "}
              <span className="text-red-400 normal-case font-normal">*</span>
            </InputLabel>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              className={`${inputCls} font-mono font-bold tracking-widest`}
            />
          </div>

          {/* Discount Type */}
          <div>
            <InputLabel>Discount Type</InputLabel>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-1 gap-1">
              {[
                { val: "percentage", label: "Percentage (%)" },
                { val: "flat", label: "Flat Amount (Rs.)" },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("discountType", val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.discountType === val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value + Min Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <InputLabel>
                {form.discountType === "percentage"
                  ? "Value (%)"
                  : "Value (Rs.)"}{" "}
                <span className="text-red-400 normal-case font-normal">*</span>
              </InputLabel>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "percentage" ? "20" : "50"}
                min={1}
                max={form.discountType === "percentage" ? 100 : undefined}
                className={inputCls}
              />
            </div>
            <div>
              <InputLabel>Min Order (Rs.)</InputLabel>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="0"
                min={0}
                className={inputCls}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <InputLabel>
              Expiry Date{" "}
              <span className="text-red-400 normal-case font-normal">*</span>
            </InputLabel>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ coupon }) => {
  const expired = isExpired(coupon.expiryDate);
  if (expired)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
        Expired
      </span>
    );
  if (!coupon.isActive)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
        Inactive
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Active
    </span>
  );
};

// ─── Loader ───────────────────────────────────────────────────────────────────
const Loader = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
    </div>
    <p className="text-sm text-gray-400">Loading coupons…</p>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
      <svg
        className="w-7 h-7 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 14l6-6M9 9h.01M15 15h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <div className="text-center">
      <p className="text-gray-800 font-semibold">No coupons yet</p>
      <p className="text-sm text-gray-400 mt-1">
        Create your first coupon to start offering discounts
      </p>
    </div>
    <button
      onClick={onAdd}
      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
      + Add Coupon
    </button>
  </div>
);

// ─── Spinner (inline) ─────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin w-3.5 h-3.5"
    viewBox="0 0 24 24"
    fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8z"
    />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, code }
  const [actionLoading, setActionLoading] = useState({}); // { [id]: true }
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback(
    (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/coupons/vendor").then((r) => r.data);
      setCoupons(data);
    } catch (err) {
      addToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggle = async (coupon) => {
    setActionLoading((a) => ({ ...a, [coupon._id]: true }));
    try {
      const updated = await api
        .put(`/coupons/${coupon._id}/toggle`)
        .then((r) => r.data);
      setCoupons((cs) =>
        cs.map((c) => (c._id === coupon._id ? { ...c, ...updated } : c))
      );
      addToast(
        `Coupon "${coupon.code}" ${
          updated.isActive ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (err) {
      addToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setActionLoading((a) => ({ ...a, [coupon._id]: false }));
    }
  };

  const handleDelete = async () => {
    const { id, code } = confirm;
    setConfirm(null);
    setActionLoading((a) => ({ ...a, [id]: true }));
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons((cs) => cs.filter((c) => c._id !== id));
      addToast(`Coupon "${code}" deleted.`);
    } catch (err) {
      addToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setActionLoading((a) => ({ ...a, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast
        toasts={toasts}
        remove={removeToast}
      />

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.code}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showModal && (
        <AddCouponModal
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => {
            addToast(msg);
            fetchCoupons();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Page Header ── same left-border accent as "Welcome back" on dashboard */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="w-1 h-8 rounded-full bg-blue-600 inline-block mt-0.5 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Manage Coupons
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading
                  ? "Loading…"
                  : `${coupons.length} coupon${
                      coupons.length !== 1 ? "s" : ""
                    } total`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Coupon
          </button>
        </div>

        {/* ── Table Card ── white card, same style as dashboard's Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <Loader />
          ) : coupons.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "Code",
                      "Discount",
                      "Min Order",
                      "Expiry Date",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {coupons.map((coupon) => {
                    const busy = !!actionLoading[coupon._id];
                    const expired = isExpired(coupon.expiryDate);

                    return (
                      <tr
                        key={coupon._id}
                        className="hover:bg-blue-50/40 transition-colors">
                        {/* Code */}
                        <td className="px-6 py-4">
                          <span className="inline-block font-mono font-bold text-gray-700 tracking-widest text-xs bg-gray-100 px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">
                            {formatDiscount(coupon)}
                          </span>
                        </td>

                        {/* Min Order */}
                        <td className="px-6 py-4 text-gray-600">
                          {coupon.minOrderAmount > 0 ? (
                            `Rs. ${coupon.minOrderAmount}`
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Expiry */}
                        <td className="px-6 py-4">
                          <span
                            className={
                              expired
                                ? "text-red-400 font-medium"
                                : "text-gray-600"
                            }>
                            {formatDate(coupon.expiryDate)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge coupon={coupon} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggle(coupon)}
                              disabled={busy || expired}
                              title={
                                expired
                                  ? "Expired coupons cannot be toggled"
                                  : undefined
                              }
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                coupon.isActive
                                  ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                                  : "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                              }`}>
                              {busy ? (
                                <Spinner />
                              ) : coupon.isActive ? (
                                "Deactivate"
                              ) : (
                                "Activate"
                              )}
                            </button>

                            <button
                              onClick={() =>
                                setConfirm({
                                  id: coupon._id,
                                  code: coupon.code,
                                })
                              }
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
