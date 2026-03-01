import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("vendorlink_token")}`,
});

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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[status] || "bg-gray-100 text-gray-600"}`}>
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ products: 0, services: 0, pendingOrders: 0, pendingBookings: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const profileRes = await fetch("/api/vendors/profile", { headers: authHeaders() });
        if (!profileRes.ok) {
          const err = await profileRes.json();
          throw new Error(err.message || "Failed to fetch vendor profile");
        }
        const profileData = await profileRes.json();
        setProfile(profileData);
        const vendorId = profileData.vendorId || profileData._id;

        const [productsRes, servicesRes, ordersRes, bookingsRes] = await Promise.all([
          fetch(`/api/products/vendor/${vendorId}`, { headers: authHeaders() }),
          fetch(`/api/services/vendor/${vendorId}`, { headers: authHeaders() }),
          fetch("/api/orders/vendor", { headers: authHeaders() }),
          fetch("/api/bookings/vendor", { headers: authHeaders() }),
        ]);

        const [products, services, orders, bookings] = await Promise.all([
          productsRes.ok ? productsRes.json() : [],
          servicesRes.ok ? servicesRes.json() : [],
          ordersRes.ok ? ordersRes.json() : [],
          bookingsRes.ok ? bookingsRes.json() : [],
        ]);

        const productsArr = Array.isArray(products) ? products : products.products || [];
        const servicesArr = Array.isArray(services) ? services : services.services || [];
        const ordersArr = Array.isArray(orders) ? orders : orders.orders || [];
        const bookingsArr = Array.isArray(bookings) ? bookings : bookings.bookings || [];

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

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-blue-600">{storeName}</span>
            </h1>
          </div>
          <p className="text-gray-400 ml-5 text-sm">Here's what's happening with your store today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <StatCard icon="📦" label="Total Products" value={stats.products} accent="bg-blue-50 text-blue-600" />
          <StatCard icon="🛠️" label="Total Services" value={stats.services} accent="bg-violet-50 text-violet-600" />
          <StatCard icon="🛒" label="Pending Orders" value={stats.pendingOrders} accent="bg-amber-50 text-amber-600" />
          <StatCard icon="📅" label="Pending Bookings" value={stats.pendingBookings} accent="bg-emerald-50 text-emerald-600" />
        </div>

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
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {order.items?.length ?? order.itemCount ?? "—"}
                        {(order.items?.length ?? order.itemCount) ? " item(s)" : ""}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        {formatCurrency(order.totalAmount ?? order.total)}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} type="order" /></td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {booking.service?.name || booking.serviceName || booking.serviceId?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(booking.scheduledDate || booking.date || booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} type="booking" /></td>
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