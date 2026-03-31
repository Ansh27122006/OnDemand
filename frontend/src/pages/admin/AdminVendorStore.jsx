import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const PLACEHOLDER_PRODUCT = "https://placehold.co/400x300?text=No+Image";
const PLACEHOLDER_SERVICE = "https://placehold.co/400x300?text=No+Image";

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

/* ── Section Header ── */
const SectionHeader = ({ icon, title, count }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-black text-slate-900">{title}</h2>
      <p className="text-xs text-slate-400">
        {count} {title.toLowerCase()} listed
      </p>
    </div>
  </div>
);

/* ── Product Card ── */
const ProductCard = ({ product }) => {
  const image = product.images?.[0] || product.image || PLACEHOLDER_PRODUCT;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="h-40 bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={product.name}
          onError={(e) => {
            e.target.src = PLACEHOLDER_PRODUCT;
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm font-black text-blue-600">
            ₹{parseFloat(product.price || 0).toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            {product.category && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                {product.category}
              </span>
            )}
            <span className="text-xs text-slate-400">
              Stock: {product.stock ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Service Card ── */
const ServiceCard = ({ service }) => {
  const image = service.images?.[0] || service.image || PLACEHOLDER_SERVICE;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="h-40 bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={service.name}
          onError={(e) => {
            e.target.src = PLACEHOLDER_SERVICE;
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 mb-0.5">
          {service.name}
        </h3>
        {service.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {service.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm font-black text-blue-600">
            ₹{parseFloat(service.price || 0).toFixed(2)}
            <span className="text-xs text-slate-400 font-normal ml-1">
              / session
            </span>
          </span>
          <div className="flex items-center gap-2">
            {service.duration && (
              <span className="text-xs text-slate-400">
                {service.duration} {service.duration === 1 ? "hr" : "hrs"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Empty Section ── */
const EmptySection = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-10 bg-white border border-slate-200 rounded-2xl gap-2 text-center">
    <p className="text-slate-400 text-sm font-medium">No {label} listed yet</p>
    <p className="text-slate-300 text-xs">
      This vendor hasn't added any {label}.
    </p>
  </div>
);

/* ══════════════════════════════════════════
   AdminVendorStore Page
══════════════════════════════════════════ */
const AdminVendorStore = () => {
  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get(`/vendors/${id}/store`);
        setVendor(res.data.vendor);
        setProducts(res.data.products || []);
        setServices(res.data.services || []);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "Vendor store not found or not approved."
            : "Failed to load vendor store. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          <Link
            to="/admin/vendors"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Vendors
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <p className="text-sm text-slate-500 font-medium truncate">
            Admin — Vendor Store Preview
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
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
        </div>
      )}

      {vendor && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* ── Vendor Profile Card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Blue accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
            <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Logo */}
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.storeName}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl shrink-0">
                  🏪
                </div>
              )}

              {/* Store info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-black text-slate-900">
                    {vendor.storeName}
                  </h1>
                  <ApprovalBadge isApproved={vendor.isApproved} />
                </div>
                {vendor.category && (
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full mb-2">
                    {vendor.category}
                  </span>
                )}
                {vendor.description && (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {vendor.description}
                  </p>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-col gap-2 shrink-0 text-sm">
                {vendor.userId?.name && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <span className="font-medium text-slate-700">
                      {vendor.userId.name}
                    </span>
                  </div>
                )}
                {vendor.userId?.email && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <span>{vendor.userId.email}</span>
                  </div>
                )}
                {vendor.contact && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    <span>{vendor.contact}</span>
                  </div>
                )}
                {vendor.location && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    <span>{vendor.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className="border-t border-slate-100 px-6 py-4 flex items-center gap-6 bg-slate-50/50">
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">
                  {products.length}
                </p>
                <p className="text-xs text-slate-400">Products</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">
                  {services.length}
                </p>
                <p className="text-xs text-slate-400">Services</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">
                  {products.length + services.length}
                </p>
                <p className="text-xs text-slate-400">Total Listings</p>
              </div>
            </div>
          </div>

          {/* ── Products Section ── */}
          <div>
            <SectionHeader
              icon="📦"
              title="Products"
              count={products.length}
            />
            {products.length === 0 ? (
              <EmptySection label="products" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Services Section ── */}
          <div>
            <SectionHeader
              icon="🛠️"
              title="Services"
              count={services.length}
            />
            {services.length === 0 ? (
              <EmptySection label="services" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorStore;
