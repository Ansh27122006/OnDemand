import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("vendorlink_token")}`,
});

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      {message}
      <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">✕</button>
    </div>
  );
};

const ConfirmDialog = ({ serviceName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Service?</h3>
      <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <span className="font-semibold text-gray-700">"{serviceName}"</span>? This action cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700">Yes, Delete</button>
      </div>
    </div>
  </div>
);

const EMPTY_FORM = { name: "", description: "", price: "", category: "", duration: "", availability: "" };

const ServiceModal = ({ editService, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(editService ? { name: editService.name || "", description: editService.description || "", price: editService.price ?? "", category: editService.category || "", duration: editService.duration || "", availability: editService.availability || "" } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Service name is required";
    if (form.price === "" || isNaN(form.price) || Number(form.price) < 0) e.price = "Valid price is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, price: Number(form.price) });
  };

  const Field = ({ label, name, type = "text", required, placeholder, as: Tag = "input", ...rest }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label} {required && <span className="text-red-400">*</span>}</label>
      <Tag name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-violet-500/30 ${errors[name] ? "border-red-300" : "border-gray-200 focus:border-violet-400"} ${Tag === "textarea" ? "resize-none h-24" : ""}`} {...rest} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-violet-600 to-violet-700">
          <div>
            <h2 className="text-lg font-bold text-white">{editService ? "Edit Service" : "Add New Service"}</h2>
            <p className="text-violet-200 text-xs mt-0.5">{editService ? "Update service details" : "Fill in the service details below"}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <Field label="Service Name" name="name" required placeholder="e.g. Home Cleaning" />
          <Field label="Description" name="description" as="textarea" placeholder="Describe your service…" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price ($)" name="price" type="number" required placeholder="0.00" min="0" step="0.01" />
            <Field label="Duration" name="duration" required placeholder="e.g. 1 hour" />
          </div>
          <Field label="Category" name="category" required placeholder="e.g. Cleaning" />
          <Field label="Availability" name="availability" placeholder="e.g. Mon–Sat 9am–6pm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editService ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ManageServices() {
  const { user } = useAuth();
  const [vendorId, setVendorId] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchServices = useCallback(async (vid) => {
    try {
      const res = await fetch(`/api/services/vendor/${vid}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : data.services || []);
    } catch (err) {
      showToast(err.message, "error");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/vendors/profile", { headers: authHeaders() });
        if (!res.ok) throw new Error("Failed to fetch vendor profile");
        const profile = await res.json();
        const vid = profile.vendorId || profile._id;
        setVendorId(vid);
        await fetchServices(vid);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchServices]);

  const handleSubmit = async (formData) => {
    const isEdit = modal?.mode === "edit";
    const url = isEdit ? `/api/services/${modal.service._id}` : "/api/services";
    const method = isEdit ? "PUT" : "POST";
    try {
      setActionLoading(true);
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...formData, vendorId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${isEdit ? "update" : "create"} service`);
      showToast(`Service ${isEdit ? "updated" : "added"} successfully!`);
      setModal(null);
      await fetchServices(vendorId);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/services/${deleteTarget._id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || "Failed to delete service"); }
      showToast("Service deleted successfully!");
      setDeleteTarget(null);
      await fetchServices(vendorId);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {modal && <ServiceModal editService={modal.mode === "edit" ? modal.service : null} onClose={() => setModal(null)} onSubmit={handleSubmit} loading={actionLoading} />}
      {deleteTarget && <ConfirmDialog serviceName={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-violet-500 to-violet-700 rounded-full" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Services</h1>
              <p className="text-gray-400 text-sm mt-0.5">{loading ? "Loading…" : `${services.length} service${services.length !== 1 ? "s" : ""} in your store`}</p>
            </div>
          </div>
          <button onClick={() => setModal({ mode: "add" })} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all">
            <span className="text-lg leading-none">＋</span> Add New Service
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Fetching services…</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center text-3xl">🛠️</div>
              <h3 className="font-semibold text-gray-700">No services yet</h3>
              <p className="text-gray-400 text-sm max-w-xs">Add your first service to start accepting bookings on the marketplace.</p>
              <button onClick={() => setModal({ mode: "add" })} className="mt-2 px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">Add First Service</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Availability</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-violet-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-base flex-shrink-0">🛠️</div>
                          <div>
                            <p className="font-semibold text-gray-800">{service.name}</p>
                            {service.description && <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{service.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">{service.category}</span></td>
                      <td className="px-6 py-4 font-semibold text-gray-800">${Number(service.price).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-gray-600 text-xs"><span className="text-base">⏱️</span>{service.duration || "—"}</span></td>
                      <td className="px-6 py-4 text-gray-500 text-xs hidden lg:table-cell">
                        {service.availability ? <span className="inline-flex items-center gap-1"><span className="text-base">📅</span>{service.availability}</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModal({ mode: "edit", service })} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100">✏️ Edit</button>
                          <button onClick={() => setDeleteTarget(service)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100">🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && services.length > 0 && <p className="text-center text-xs text-gray-400 mt-4">Showing {services.length} service{services.length !== 1 ? "s" : ""}</p>}
      </div>
    </div>
  );
}