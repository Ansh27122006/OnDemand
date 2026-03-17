import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import CATEGORIES from "../../constants/categories";

const EMPTY_FORM = { storeName: "", description: "", category: "" };

/* ── Approval Badge ── */
const ApprovalBadge = ({ isApproved }) =>
  isApproved ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      Approved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
      Pending Approval
    </span>
  );

/* ── Profile Form ── */
const ProfileForm = ({ initial = EMPTY_FORM, onSubmit, loading, isEdit }) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  /* Keep form in sync if initial changes (e.g. edit opened after fetch) */
  useEffect(() => {
    setForm(initial);
  }, [initial.storeName, initial.description, initial.category]);

  const validate = () => {
    const e = {};
    if (!form.storeName.trim()) e.storeName = "Store name is required";
    if (!form.category) e.category = "Please select a category";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const inputBase =
    "w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors";
  const inputClass = (field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-violet-400"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5">
      {/* Store Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Store Name <span className="text-red-400">*</span>
        </label>
        <input
          name="storeName"
          type="text"
          value={form.storeName}
          onChange={handleChange}
          placeholder="e.g. John's Electronics"
          className={inputClass("storeName")}
        />
        {errors.storeName && (
          <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Tell customers about your store…"
          rows={4}
          className={`${inputClass("description")} resize-none`}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Category <span className="text-red-400">*</span>
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className={inputClass("category")}>
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option
              key={cat}
              value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
        {loading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {isEdit ? "Save Changes" : "Create Store Profile"}
      </button>
    </form>
  );
};

/* ── Detail Row ── */
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
    <span className="sm:w-36 text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0 pt-0.5">
      {label}
    </span>
    <span className="text-sm text-gray-800 leading-relaxed">
      {value || <span className="text-gray-300 italic">Not provided</span>}
    </span>
  </div>
);

/* ══════════════════════════════════════════
   VendorProfile Page
══════════════════════════════════════════ */
export default function VendorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); // null = not yet fetched
  const [fetching, setFetching] = useState(true); // initial load
  const [editing, setEditing] = useState(false); // edit mode toggle
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  /* ── Show toast and auto-dismiss ── */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Fetch profile on mount ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/vendors/profile");
        setProfile(res.data.profile || res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null); // no profile yet → show create form
        } else {
          showToast("Failed to load profile. Please refresh.", "error");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── Create profile ── */
  const handleCreate = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.post("/vendors/profile", formData);
      setProfile(res.data.profile || res.data);
      showToast("Store profile created successfully!");
      navigate("/vendor/dashboard");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create profile.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Update profile ── */
  const handleUpdate = async (formData) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/vendors/${profile._id}`, formData);
      setProfile(res.data.profile || res.data);
      setEditing(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update profile.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Loading state ── */
  if (fetching) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-white">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
          <span className="text-lg">
            {toast.type === "success" ? "✅" : "❌"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
            ✕
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-violet-700 rounded-full" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {profile ? "Store Profile" : "Create Store Profile"}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {profile
                ? "Manage your store's public information"
                : "Set up your store to start selling on OnDemand"}
            </p>
          </div>
        </div>

        {/* ══ MODE 1: No profile — show create form ══ */}
        {!profile && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-violet-700">
              <h2 className="text-base font-bold text-white">
                New Store Details
              </h2>
              <p className="text-violet-200 text-xs mt-0.5">
                This information will be visible to customers on the
                marketplace.
              </p>
            </div>
            <div className="p-6">
              <ProfileForm
                onSubmit={handleCreate}
                loading={actionLoading}
                isEdit={false}
              />
            </div>
          </div>
        )}

        {/* ══ MODE 2: Profile exists ══ */}
        {profile && (
          <div className="flex flex-col gap-6">
            {/* Approval notice banner */}
            {!profile.isApproved && (
              <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
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
                <p className="text-amber-800 text-sm font-medium">
                  Your store is under review. You'll be able to list products
                  and services once an admin approves your profile.
                </p>
              </div>
            )}

            {/* ── View Mode ── */}
            {!editing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Card header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center text-xl">
                      🏪
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {profile.storeName}
                      </h2>
                      <div className="mt-1">
                        <ApprovalBadge isApproved={profile.isApproved} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-lg border border-violet-100 transition-colors">
                    ✏️ Edit
                  </button>
                </div>

                {/* Details */}
                <div className="px-6">
                  <DetailRow
                    label="Store Name"
                    value={profile.storeName}
                  />
                  <DetailRow
                    label="Category"
                    value={profile.category}
                  />
                  <DetailRow
                    label="Description"
                    value={profile.description}
                  />
                  <DetailRow
                    label="Status"
                    value={<ApprovalBadge isApproved={profile.isApproved} />}
                  />
                </div>
              </div>
            )}

            {/* ── Edit Mode ── */}
            {editing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Edit Store Profile
                    </h2>
                    <p className="text-violet-200 text-xs mt-0.5">
                      Update your store's public information
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-white/70 hover:text-white text-xl leading-none transition-colors">
                    ✕
                  </button>
                </div>
                <div className="p-6">
                  <ProfileForm
                    initial={{
                      storeName: profile.storeName || "",
                      description: profile.description || "",
                      category: profile.category || "",
                    }}
                    onSubmit={handleUpdate}
                    loading={actionLoading}
                    isEdit={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
