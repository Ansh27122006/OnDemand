import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import CATEGORIES from "../../constants/categories";

const PLACEHOLDER = "https://placehold.co/400x300?text=No+Image";

const getDiscountedPrice = (item) => {
  const productDiscount = item.discountPercentage || 0;
  const storeDiscount = item.vendorId?.onSale ? (item.vendorId.salePercentage || 0) : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0) return { finalPrice: item.price, discount: 0, isStoreSale: false };
  const finalPrice = Math.round(item.price - (item.price * effectiveDiscount / 100));
  return { finalPrice, discount: effectiveDiscount, isStoreSale: item.vendorId?.onSale && storeDiscount >= productDiscount };
};

const ProductCard = ({ product }) => {
  const image = product.images?.[0] || product.image || PLACEHOLDER;
  const { finalPrice, discount, isStoreSale } = getDiscountedPrice(product);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={image}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          className="w-full h-full object-cover"
        />
        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-semibold rounded-full border border-blue-100 shadow-sm">
            {product.category}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}
        {isStoreSale && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
            STORE SALE
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}
        {product.vendorId?.storeName && (
          <Link
            to={`/store/${product.vendorId._id}`}
            className="text-xs text-slate-400 hover:text-blue-600 hover:underline mb-2 inline-block transition-colors"
            onClick={(e) => e.stopPropagation()}>
            🏪 {product.vendorId.storeName}
          </Link>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {discount > 0 ? (
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 line-through">
                  ₹{parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-lg font-black text-green-600">
                  ₹{finalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-black text-blue-600">
                ₹{parseFloat(product.price || 0).toFixed(2)}
              </span>
            )}
          </div>
          <Link
            to={`/products/${product._id}`}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading products...</p>
  </div>
);

const EmptyState = ({ query, category, vendor }) => (
  <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
      <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <div>
      <p className="text-slate-700 font-bold text-lg">No products found</p>
      <p className="text-slate-400 text-sm mt-1">
        {query || category || vendor
          ? `No results match your current filters. Try adjusting or clearing them.`
          : "There are no products available right now. Check back soon!"}
      </p>
    </div>
  </div>
);

const selectClass =
  "sm:w-52 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm appearance-none cursor-pointer";

const BrowseProducts = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productsRes, vendorsRes] = await Promise.all([
          api.get("/products"),
          api.get("/vendors/"),
        ]);
        const productsData = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || [];
        const vendorsData = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.vendors || [];
        setProducts(productsData);
        setVendors(vendorsData);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      const matchesVendor = selectedVendor ? p.vendorId?._id === selectedVendor || p.vendorId === selectedVendor : true;
      return matchesSearch && matchesCategory && matchesVendor;
    });
  }, [products, searchQuery, selectedCategory, selectedVendor]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedVendor("");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedVendor;
  const selectedVendorName = vendors.find((v) => v._id === selectedVendor)?.storeName;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Browse Products</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {loading ? "Loading..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectClass}>
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className={selectClass}>
            <option value="">All Stores</option>
            {vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.storeName}</option>)}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap">
              Clear Filters
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("")} className="hover:text-blue-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
            {selectedVendor && selectedVendorName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100">
                Store: {selectedVendorName}
                <button onClick={() => setSelectedVendor("")} className="hover:text-orange-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : filteredProducts.length === 0 ? (
          <EmptyState query={searchQuery} category={selectedCategory} vendor={selectedVendor} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProducts;