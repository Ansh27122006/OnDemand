import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const Field = ({
  label,
  name,
  type = "text",
  required,
  placeholder,
  as: Tag = "input",
  form,
  errors,
  onChange,
  ...rest
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <Tag
      name={name}
      type={type}
      value={form[name]}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-violet-500/30 ${
        errors[name]
          ? "border-red-300"
          : "border-gray-200 focus:border-violet-400"
      } ${Tag === "textarea" ? "resize-none h-24" : ""}`}
      {...rest}
    />
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
);

/* ══════════════════════════════════════════
   Toast
══════════════════════════════════════════ */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${
        type === "success"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      {message}
      <button
        onClick={onClose}
        className="ml-2 text-current opacity-50 hover:opacity-100">
        ✕
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════
   ConfirmDialog
══════════════════════════════════════════ */
const ConfirmDialog = ({ itemName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
        🗑️
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product?</h3>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-700">"{itemName}"</span>? This
        action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700">
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   ProductModal
══════════════════════════════════════════ */
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
};

const ProductModal = ({ editProduct, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(
    editProduct
      ? {
          name: editProduct.name || "",
          description: editProduct.description || "",
          price: editProduct.price ?? "",
          category: editProduct.category || "",
          stock: editProduct.stock ?? "",
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});

  // ── ADDED: image file and preview state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    editProduct?.images?.[0] || null
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (
      form.price === "" ||
      isNaN(Number(form.price)) ||
      Number(form.price) < 0
    )
      e.price = "Valid price is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (
      form.stock === "" ||
      isNaN(Number(form.stock)) ||
      Number(form.stock) < 0
    )
      e.stock = "Valid stock quantity is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── ADDED: handle image file selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── ADDED: clear selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(editProduct?.images?.[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    // ── CHANGED: pass imageFile as second argument
    onSubmit(
      {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
      },
      imageFile
    );
  };

  const fieldProps = { form, errors, onChange: handleChange };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-violet-600 to-violet-700">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-violet-200 text-xs mt-0.5">
              {editProduct
                ? "Update product details"
                : "Fill in the product details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <Field
            label="Product Name"
            name="name"
            required
            placeholder="e.g. Wireless Headphones"
            {...fieldProps}
          />
          <Field
            label="Description"
            name="description"
            as="textarea"
            placeholder="Describe your product…"
            {...fieldProps}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price (₹)"
              name="price"
              type="number"
              required
              placeholder="0.00"
              min="0"
              step="any"
              inputMode="decimal"
              {...fieldProps}
            />
            <Field
              label="Stock"
              name="stock"
              type="number"
              required
              placeholder="0"
              min="0"
              step="1"
              {...fieldProps}
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
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-violet-500/30 ${
                errors.category
                  ? "border-red-300"
                  : "border-gray-200 focus:border-violet-400"
              }`}>
              <option value="">Select a category</option>
              {[
                "Electronics & Gadgets",
                "Food & Beverages",
                "Home Services",
                "Fashion & Clothing",
                "Health & Beauty",
                "Education & Training",
                "Repair & Maintenance",
                "IT & Technology",
                "Healthcare & Medical",
                "Transportation & Logistics",
                "Construction & Real Estate",
                "Financial Services",
                "Events & Entertainment",
                "Marketing & Advertising",
                "Cleaning Services",
                "Security Services",
                "Legal Services",
                "Photography & Media",
                "Sports & Fitness",
                "Automotive",
                "Pet Services",
                "Rental Services",
                "Agriculture",
                "Childcare & Senior Care",
                "Other",
              ].map((cat) => (
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

          {/* ── ADDED: Image Upload Field ── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Product Image
            </label>

            {/* Preview */}
            {imagePreview && (
              <div className="relative mb-2 w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                  ✕
                </button>
              </div>
            )}

            {/* File input */}
            <label className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-violet-400 bg-gray-50 hover:bg-violet-50/30 cursor-pointer transition-colors">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-sm text-gray-400">
                {imageFile ? imageFile.name : "Click to upload an image"}
              </span>
              <input
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editProduct ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ManageProducts (main page)
══════════════════════════════════════════ */
export default function ManageProducts() {
  const { user } = useAuth();
  const [vendorId, setVendorId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [profile, setProfile] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/products/my/list");
      const data = res.data;
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vendors/profile");
        const prof = res.data;
        setProfile(prof);
        const vid = prof.vendorId || prof._id;
        setVendorId(vid);
        await fetchProducts();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchProducts]);

  // ── CHANGED: accept imageFile as second argument and use FormData
  const handleSubmit = async (formFields, imageFile) => {
    const isEdit = modal?.mode === "edit";
    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append("name", formFields.name);
      formData.append("description", formFields.description);
      formData.append("price", formFields.price);
      formData.append("category", formFields.category);
      formData.append("stock", formFields.stock);
      formData.append("vendorId", vendorId);
      if (imageFile) formData.append("image", imageFile);

      if (isEdit) {
        await api.put(`/products/${modal.product._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      showToast(`Product ${isEdit ? "updated" : "added"} successfully!`);
      setModal(null);
      await fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await api.delete(`/products/${deleteTarget._id}`);
      showToast("Product deleted successfully!");
      setDeleteTarget(null);
      await fetchProducts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-white">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {modal && (
        <ProductModal
          editProduct={modal.mode === "edit" ? modal.product : null}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          loading={actionLoading}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          itemName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-violet-700 rounded-full" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Manage Products
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {loading
                  ? "Loading…"
                  : `${products.length} product${
                      products.length !== 1 ? "s" : ""
                    } in your store`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!profile?.isApproved) {
                showToast(
                  "Your vendor account is not yet approved. Please wait for admin approval.",
                  "error"
                );
                return;
              }
              setModal({ mode: "add" });
            }}
            disabled={!profile?.isApproved}
            className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-xl text-sm shadow-sm transition-all ${
              profile?.isApproved
                ? "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
            }`}>
            <span className="text-lg leading-none">＋</span> Add New Product
          </button>
        </div>

        {/* Approval banner */}
        {profile && !profile.isApproved && (
          <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
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
            <span className="text-amber-800 font-semibold text-sm">
              Your vendor account is pending admin approval. You can't add
              products until approved.
            </span>
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Fetching products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-3xl">
                📦
              </div>
              <h3 className="font-semibold text-gray-700">No products yet</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {profile?.isApproved
                  ? "Add your first product to start selling on the marketplace."
                  : "You can add products once your vendor account is approved by admin."}
              </p>
              {profile?.isApproved && (
                <button
                  onClick={() => setModal({ mode: "add" })}
                  className="mt-2 px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                  Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {["Product", "Category", "Price", "Stock", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                            h === "Actions" ? "text-right" : "text-left"
                          }`}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-violet-50/20 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* ── CHANGED: show product image thumbnail if available */}
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-base flex-shrink-0">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        ₹{Number(product.price).toFixed(2)}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-base">📊</span>
                          {product.stock ?? "—"} units
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ mode: "edit", product })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100">
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100">
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && products.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
