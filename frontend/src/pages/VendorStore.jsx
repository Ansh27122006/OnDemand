import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const getDiscountedPrice = (item, vendor) => {
  const productDiscount = item.discountPercentage || 0;
  const storeDiscount = vendor?.onSale ? (vendor.salePercentage || 0) : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0) return { finalPrice: item.price, discount: 0, isStoreSale: false };
  const finalPrice = Math.round(item.price - (item.price * effectiveDiscount / 100));
  return { finalPrice, discount: effectiveDiscount, isStoreSale: vendor?.onSale && storeDiscount >= productDiscount };
};

// ── NEW: Social link icon button ──
const SocialLink = ({ href, label, children }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-500 transition-colors duration-150">
      {children}
    </a>
  ) : null;

const VendorStore = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data } = await api.get(`/vendors/${vendorId}/store`);
        setStore(data.vendor);
        setProducts(data.products);
        setServices(data.services);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-bold text-gray-700 mb-2">Store Not Found</h2>
        <p className="text-gray-500 mb-6">
          This store does not exist or is not approved yet.
        </p>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    );
  }

  // ── NEW: check if vendor has any social links ──
  const hasSocialLinks =
    store.website ||
    store.instagram ||
    store.facebook ||
    store.twitter ||
    store.youtube;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {store.storeName?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-800">{store.storeName}</h1>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                ✓ Verified Store
              </span>
              {store.onSale && (
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  🏷️ STORE SALE — {store.salePercentage}% OFF
                </span>
              )}
            </div>
            <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {store.businessCategory}
            </span>
            <p className="text-gray-500 text-sm mt-2">{store.description}</p>
            <p className="text-gray-400 text-sm mt-1">By {store.userId?.name}</p>

            

            {/* ── NEW: Social media links row ── */}
            {hasSocialLinks && (
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                {/* Website — Globe */}
                <SocialLink href={store.website} label="Website">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
                  </svg>
                </SocialLink>

                {/* Instagram */}
                <SocialLink href={store.instagram} label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </SocialLink>

                {/* Facebook */}
                <SocialLink href={store.facebook} label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialLink>

                {/* Twitter / X */}
                <SocialLink href={store.twitter} label="Twitter / X">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialLink>

                {/* YouTube */}
                <SocialLink href={store.youtube} label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialLink>
              </div>
            )}

            {/* Chat with Vendor button (customers only) */}
            {user?.role === "customer" && store.userId?._id && (
              <button
                onClick={() => navigate(`/chat/${store.userId._id}`)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                           active:bg-blue-800 text-white text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0
                       01-4-.84L3 20l1.09-3.27C3.4 15.46 3 13.77 3 12c0-4.418 4.03-8 9-8s9
                       3.582 9 8z"
                  />
                </svg>
                Chat with Vendor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-6 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "services"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Services ({services.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {products.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No products listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const { finalPrice, discount, isStoreSale } = getDiscountedPrice(product, store);
                  return (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="relative">
                        <img
                          src={product.images?.[0] || "https://via.placeholder.com/200x150?text=No+Image"}
                          alt={product.name}
                          className="w-full h-36 object-cover"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {isStoreSale && (
                          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            STORE SALE
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                        {discount > 0 ? (
                          <div className="mt-1">
                            <span className="text-green-600 font-bold text-sm">Rs. {finalPrice}</span>
                            <span className="text-gray-400 text-xs line-through ml-1">Rs. {product.price}</span>
                          </div>
                        ) : (
                          <p className="text-blue-600 font-bold text-sm mt-1">Rs. {product.price}</p>
                        )}
                        <p className="text-gray-400 text-xs">{product.category}</p>
                        <Link
                          to={`/products/${product._id}`}
                          className="mt-2 block text-center bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                          View Product
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <>
            {services.length === 0 ? (
              <p className="text-gray-400 text-center py-12">No services listed yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map((service) => {
                  const { finalPrice, discount, isStoreSale } = getDiscountedPrice(service, store);
                  return (
                    <div key={service._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                      <div className="relative">
                        <img
                          src={service.images?.[0] || "https://via.placeholder.com/200x150?text=No+Image"}
                          alt={service.name}
                          className="w-full h-36 object-cover"
                        />
                        {discount > 0 && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {isStoreSale && (
                          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            STORE SALE
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{service.name}</h3>
                        {discount > 0 ? (
                          <div className="mt-1">
                            <span className="text-green-600 font-bold text-sm">Rs. {finalPrice}</span>
                            <span className="text-gray-400 text-xs line-through ml-1">Rs. {service.price}</span>
                          </div>
                        ) : (
                          <p className="text-blue-600 font-bold text-sm mt-1">Rs. {service.price}</p>
                        )}
                        <p className="text-gray-400 text-xs">{service.duration} hrs · {service.category}</p>
                        <Link
                          to={`/services/${service._id}`}
                          className="mt-2 block text-center bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                          View Service
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VendorStore;