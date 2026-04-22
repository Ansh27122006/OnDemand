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
        <h2 className="text-3xl font-bold text-gray-700 mb-2">
          Store Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          This store does not exist or is not approved yet.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {store.storeName?.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-gray-800">
                {store.storeName}
              </h1>
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
            <p className="text-gray-400 text-sm mt-1">
              By {store.userId?.name}
            </p>

            {/* ── Chat with Vendor button (customers only) ── */}
            {user?.role === "customer" && store.userId?._id && (
              <button
                onClick={() => navigate(`/chat/${store.userId._id}`)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                           active:bg-blue-800 text-white text-sm font-medium
                           px-4 py-2 rounded-lg transition-colors shadow-sm">
                {/* Chat icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
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
              <p className="text-gray-400 text-center py-12">
                No products listed yet.
              </p>
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
              <p className="text-gray-400 text-center py-12">
                No services listed yet.
              </p>
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
