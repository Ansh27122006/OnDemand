import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const StatusBadge = ({ status, type = "order" }) => {
  const orderColors = {
    pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    confirmed: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-red-100 text-red-700 ring-1 ring-red-200",
  };
  const bookingColors = {
    pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    confirmed: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    completed: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-red-100 text-red-700 ring-1 ring-red-200",
  };
  const colors = type === "booking" ? bookingColors : orderColors;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-gray-400 text-sm tracking-wide">Loading your dashboard…</p>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    services: 0,
    pendingOrders: 0,
    pendingBookings: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Sale toggle state
  const [saleInput, setSaleInput] = useState("");
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleMessage, setSaleMessage] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const profileRes = await api.get("/vendors/profile");
        const profileData = profileRes.data;
        setProfile(profileData);

        let productsArr = [];
        let servicesArr = [];
        let ordersArr = [];
        let bookingsArr = [];

        try {
          const productsRes = await api.get(`/products/my/list`);
          productsArr = Array.isArray(productsRes.data)
            ? productsRes.data
            : productsRes.data.products || [];
        } catch (err) {
          productsArr = [];
        }

        try {
          const servicesRes = await api.get(`/services/my/list`);
          servicesArr = Array.isArray(servicesRes.data)
            ? servicesRes.data
            : servicesRes.data.services || [];
        } catch (err) {
          servicesArr = [];
        }

        try {
          const ordersRes = await api.get("/orders/vendor");
          ordersArr = Array.isArray(ordersRes.data)
            ? ordersRes.data
            : ordersRes.data.orders || [];
        } catch { ordersArr = []; }

        try {
          const bookingsRes = await api.get("/bookings/vendor");
          bookingsArr = Array.isArray(bookingsRes.data)
            ? bookingsRes.data
            : bookingsRes.data.bookings || [];
        } catch { bookingsArr = []; }

        setStats({
          products: productsArr.length,
          services: servicesArr.length,
          pendingOrders: ordersArr.filter((o) => o.status === "pending").length,
          pendingBookings: bookingsArr.filter((b) => b.status === "pending").length,
        });

        setRecentOrders([...ordersArr].reverse().slice(0, 5));
        setRecentBookings([...bookingsArr].reverse().slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleToggleSale = async () => {
    try {
      setSaleLoading(true);
      setSaleMessage(null);
      const body = profile?.onSale ? {} : { salePercentage: Number(saleInput) };
      const res = await api.put("/vendors/toggle-sale", body);
      setProfile((prev) => ({
        ...prev,
        onSale: res.data.onSale,
        salePercentage: res.data.salePercentage,
      }));
      setSaleMessage(res.data.onSale ? "Sale activated!" : "Sale ended");
      if (!res.data.onSale) setSaleInput("");
    } catch (err) {
      setSaleMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaleLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-red-700 mb-1">Something went wrong</h2>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const storeName = profile?.storeName || profile?.businessName || user?.name || "Your Store";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-blue-600">{storeName}</span>
            </h1>
          </div>
          {profile && !profile.isApproved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p className="text-amber-800 font-semibold">
                  Your vendor account is pending admin approval. You won't appear in public listings until approved.
                </p>
              </div>
            </div>
          )}
          <p className="text-gray-400 ml-5 text-sm">Here's what's happening with your store today.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <StatCard icon="📦" label="Total Products" value={stats.products} accent="bg-blue-50 text-blue-600" />
          <StatCard icon="🛠️" label="Total Services" value={stats.services} accent="bg-violet-50 text-violet-600" />
          <StatCard icon="🛒" label="Pending Orders" value={stats.pendingOrders} accent="bg-amber-50 text-amber-600" />
          <StatCard icon="📅" label="Pending Bookings" value={stats.pendingBookings} accent="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Store Sale Section ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏷️</span>
            <h2 className="text-base font-bold text-gray-800">Store Sale</h2>
          </div>

          {profile?.onSale ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 font-bold text-sm animate-pulse">
                🟢 SALE ACTIVE — {profile.salePercentage}% OFF
              </span>
              <button
                onClick={handleToggleSale}
                disabled={saleLoading}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center gap-2">
                {saleLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                End Sale
              </button>
              {saleMessage && (
                <span className="text-sm font-medium text-gray-500">{saleMessage}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-medium text-sm">
                No active sale
              </span>
              <input
                type="number"
                min="1"
                max="99"
                value={saleInput}
                onChange={(e) => setSaleInput(e.target.value)}
                placeholder="Sale % (e.g. 20)"
                className="w-44 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
              />
              <button
                onClick={handleToggleSale}
                disabled={saleLoading}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm disabled:opacity-60 flex items-center gap-2">
                {saleLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Start Sale
              </button>
              {saleMessage && (
                <span className="text-sm font-medium text-red-500">{saleMessage}</span>
              )}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {/* ── Recent Orders ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Last 5</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70">
                    {["Customer", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order, i) => (
                    <tr key={order._id || i} className="hover:bg-blue-50/30 transition-colors duration-100">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {order.customer?.name || order.customerName || order.userId?.name || "Unknown"}
                        {/* ✅ FIXED — reads customerId.name from backend */}
                        {order.customerId?.name ||
                          order.customer?.name ||
                          order.customerName ||
                          "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {order.items?.length ?? order.itemCount ?? "—"}
                        {order.items?.length ?? order.itemCount ? " item(s)" : ""}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {formatCurrency(order.totalAmount ?? order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        {/* ── Recent Bookings ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <h2 className="text-base font-bold text-gray-800">Recent Bookings</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Last 5</span>
          </div>
          {recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/70">
                    {["Customer", "Service", "Scheduled", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map((booking, i) => (
                    <tr key={booking._id || i} className="hover:bg-blue-50/30 transition-colors duration-100">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {booking.customer?.name || booking.customerName || booking.userId?.name || "Unknown"}
                        {/* ✅ FIXED — reads customerId.name from backend */}
                        {booking.customerId?.name ||
                          booking.customer?.name ||
                          booking.customerName ||
                          "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {booking.service?.name || booking.serviceName || booking.serviceId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(booking.scheduledDate || booking.date || booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} type="booking" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}