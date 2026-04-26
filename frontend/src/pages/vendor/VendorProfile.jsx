import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import CATEGORIES from "../../constants/categories";

const EMPTY_FORM = {
  storeName: "",
  description: "",
  category: "",
  // ── Social media & website ──
  website: "",
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
};

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
const ProfileForm = ({
  initial = EMPTY_FORM,
  existingLogo = null,
  onSubmit,
  loading,
  isEdit,
}) => {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(existingLogo || null);

  /* Keep form in sync if initial changes */
  useEffect(() => {
    setForm(initial);
  }, [
    initial.storeName,
    initial.description,
    initial.category,
    initial.website,
    initial.instagram,
    initial.facebook,
    initial.twitter,
    initial.youtube,
  ]);

  /* Sync logo preview when existingLogo changes */
  useEffect(() => {
    setLogoPreview(existingLogo || null);
  }, [existingLogo]);

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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(existingLogo || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form, logoFile);
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
    <form onSubmit={handleSubmit} className="space-y-5">

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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category}</p>
        )}
      </div>

      {/* Store Logo Upload */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Store Logo
        </label>
        {logoPreview && (
          <div className="relative mb-2 w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
              ✕
            </button>
          </div>
        )}
        <label className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-violet-400 bg-gray-50 hover:bg-violet-50/30 cursor-pointer transition-colors">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-gray-400">
            {logoFile ? logoFile.name : "Click to upload a logo"}
          </span>
          <input
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP. Max 5MB.</p>
      </div>

      {/* ══ NEW: Online Presence (Optional) ══ */}
      <div className="pt-2">
        {/* Section heading */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
            Online Presence (Optional)
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="space-y-4">
          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Website
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🌐</span>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className={`${inputClass("website")} pl-9`}
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📸</span>
              <input
                name="instagram"
                type="url"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourhandle"
                className={`${inputClass("instagram")} pl-9`}
              />
            </div>
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Facebook
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📘</span>
              <input
                name="facebook"
                type="url"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
                className={`${inputClass("facebook")} pl-9`}
              />
            </div>
          </div>

          {/* Twitter / X */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Twitter / X
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🐦</span>
              <input
                name="twitter"
                type="url"
                value={form.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
                className={`${inputClass("twitter")} pl-9`}
              />
            </div>
          </div>

          {/* YouTube */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              YouTube
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">▶️</span>
              <input
                name="youtube"
                type="url"
                value={form.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/yourchannel"
                className={`${inputClass("youtube")} pl-9`}
              />
            </div>
          </div>
        </div>
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

/* ── Social Link Row ── */
const SocialRow = ({ label, value, icon }) =>
  value ? (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
      <span className="sm:w-36 text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
        {icon} {label}
      </span>
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-violet-600 hover:text-violet-700 hover:underline truncate">
        {value}
      </a>
    </div>
  ) : null;

/* ══════════════════════════════════════════
   VendorProfile Page
══════════════════════════════════════════ */
export default function VendorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
          setProfile(null);
        } else {
          showToast("Failed to load profile. Please refresh.", "error");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCreate = async (formFields, logoFile) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("storeName", formFields.storeName);
      formData.append("description", formFields.description || "");
      formData.append("category", formFields.category);
      if (logoFile) formData.append("logo", logoFile);
      // ── NEW: append social fields if filled ──
      if (formFields.website)   formData.append("website",   formFields.website);
      if (formFields.instagram) formData.append("instagram", formFields.instagram);
      if (formFields.facebook)  formData.append("facebook",  formFields.facebook);
      if (formFields.twitter)   formData.append("twitter",   formFields.twitter);
      if (formFields.youtube)   formData.append("youtube",   formFields.youtube);

      const res = await api.post("/vendors/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  const handleUpdate = async (formFields, logoFile) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("storeName", formFields.storeName);
      formData.append("description", formFields.description || "");
      formData.append("category", formFields.category);
      if (logoFile) formData.append("logo", logoFile);
      // ── NEW: always append social fields (empty string clears them) ──
      formData.append("website",   formFields.website   || "");
      formData.append("instagram", formFields.instagram || "");
      formData.append("facebook",  formFields.facebook  || "");
      formData.append("twitter",   formFields.twitter   || "");
      formData.append("youtube",   formFields.youtube   || "");

      const res = await api.put(`/vendors/${profile._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  if (fetching) return <Loader />;

  // ── Check if vendor has any social links ──
  const hasSocialLinks =
    profile?.website ||
    profile?.instagram ||
    profile?.facebook ||
    profile?.twitter ||
    profile?.youtube;

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
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
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
              <h2 className="text-base font-bold text-white">New Store Details</h2>
              <p className="text-violet-200 text-xs mt-0.5">
                This information will be visible to customers on the marketplace.
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
                <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
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
                    {profile.logo ? (
                      <img
                        src={profile.logo}
                        alt={profile.storeName}
                        className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center text-xl">
                        🏪
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{profile.storeName}</h2>
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
                  <DetailRow label="Store Name" value={profile.storeName} />
                  <DetailRow label="Category" value={profile.category} />
                  <DetailRow label="Description" value={profile.description} />
                  <DetailRow
                    label="Logo"
                    value={
                      profile.logo ? (
                        <img
                          src={profile.logo}
                          alt="Store logo"
                          className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                        />
                      ) : null
                    }
                  />
                  <DetailRow label="Status" value={<ApprovalBadge isApproved={profile.isApproved} />} />

                  {/* ── NEW: Social links in view mode (only shown if at least one exists) ── */}
                  {hasSocialLinks && (
                    <div className="pt-2 pb-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-4 pb-2">
                        Online Presence
                      </p>
                      <SocialRow label="Website"    value={profile.website}   icon="🌐" />
                      <SocialRow label="Instagram"  value={profile.instagram} icon="📸" />
                      <SocialRow label="Facebook"   value={profile.facebook}  icon="📘" />
                      <SocialRow label="Twitter / X" value={profile.twitter}  icon="🐦" />
                      <SocialRow label="YouTube"    value={profile.youtube}   icon="▶️" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Edit Mode ── */}
            {editing && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Edit Store Profile</h2>
                    <p className="text-violet-200 text-xs mt-0.5">Update your store's public information</p>
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
                      storeName:   profile.storeName   || "",
                      description: profile.description || "",
                      category:    profile.category    || "",
                      // ── NEW: pre-fill social fields in edit mode ──
                      website:   profile.website   || "",
                      instagram: profile.instagram || "",
                      facebook:  profile.facebook  || "",
                      twitter:   profile.twitter   || "",
                      youtube:   profile.youtube   || "",
                    }}
                    existingLogo={profile.logo || null}
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