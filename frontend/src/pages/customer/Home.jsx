import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* ── Status config ── */
const statusConfig = {
  pending: {
    classes: "bg-amber-50 text-amber-600 border-amber-100",
    dot: "bg-amber-500",
  },
  confirmed: {
    classes: "bg-blue-50 text-blue-600 border-blue-100",
    dot: "bg-blue-500",
  },
  delivered: {
    classes: "bg-green-50 text-green-600 border-green-100",
    dot: "bg-green-500 animate-pulse",
  },
  cancelled: {
    classes: "bg-red-50 text-red-500 border-red-100",
    dot: "bg-red-400",
  },
  booked: {
    classes: "bg-indigo-50 text-indigo-600 border-indigo-100",
    dot: "bg-indigo-500",
  },
  completed: {
    classes: "bg-teal-50 text-teal-600 border-teal-100",
    dot: "bg-teal-500",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || {
    classes: "bg-slate-50 text-slate-500 border-slate-100",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {status || "Unknown"}
    </span>
  );
};

/* ── Skeleton loader for cards ── */
const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
    <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
    <div className="h-8 bg-slate-100 rounded w-1/3 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-2/3" />
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, loading, to, color, ring }) => (
  <Link
    to={to}
    className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 group`}>
    <div className="flex items-center justify-between">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ring-4 ${color} ${ring}`}>
        {icon}
      </div>
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
    {loading ? (
      <div className="h-8 bg-slate-100 rounded w-1/3 animate-pulse" />
    ) : (
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">
          {value ?? "—"}
        </p>
        <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
      </div>
    )}
  </Link>
);

/* ── Section header ── */
const SectionHeader = ({ title, to, linkLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-black text-slate-800">{title}</h2>
    {to && (
      <Link
        to={to}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
        {linkLabel}
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    )}
  </div>
);

/* ── Empty mini state ── */
const MiniEmpty = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
    <p className="text-slate-400 text-sm font-medium">{message}</p>
  </div>
);

/* ══════════════════════════════════════════
   Home (Customer Dashboard)
══════════════════════════════════════════ */
const Home = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  // Greet by time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // First name only
  const firstName = user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, bookingsRes, cartRes] = await Promise.all([
          api.get("/orders/my"),
          api.get("/bookings/my"),
          api.get("/cart"),
        ]);

        const ordersData = Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data.orders || [];
        const bookingsData = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data.bookings || [];
        const cartData = Array.isArray(cartRes.data)
          ? cartRes.data
          : cartRes.data.items || cartRes.data.cart || [];

        setOrders(ordersData);
        setBookings(bookingsData);
        setCartCount(
          cartData.reduce((sum, item) => sum + (item.quantity || 1), 0)
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
      } finally {
        setStatsLoading(false);
        setRecentLoading(false);
      }
    };

    fetchAll();
  }, []);

  const recentOrders = orders.slice(0, 3);
  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero welcome banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-blue-300 text-sm font-semibold mb-1">
            {greeting} 👋
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, <span className="text-blue-400">{firstName}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Here's a summary of your activity on OnDemand.
          </p>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/products"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              Browse Products
            </Link>
            <Link
              to="/services"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold rounded-xl transition-colors backdrop-blur">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                />
              </svg>
              Browse Services
            </Link>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="h-8 bg-gradient-to-t from-slate-50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 space-y-10">
        {/* ── Stat Cards ── */}
        <section>
          <SectionHeader title="Your Activity" />
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                to="/customer/orders"
                label="Total Orders"
                value={orders.length}
                color="bg-blue-50 text-blue-600"
                ring="ring-blue-100"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                    />
                  </svg>
                }
              />
              <StatCard
                to="/customer/bookings"
                label="Total Bookings"
                value={bookings.length}
                color="bg-violet-50 text-violet-600"
                ring="ring-violet-100"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                }
              />
              <StatCard
                to="/cart"
                label="Items in Cart"
                value={cartCount}
                color="bg-emerald-50 text-emerald-600"
                ring="ring-emerald-100"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                }
              />
            </div>
          )}
        </section>

        {/* ── Recent Orders + Bookings ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <section>
            <SectionHeader
              title="Recent Orders"
              to="/customer/orders"
              linkLabel="View all"
            />
            {recentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <MiniEmpty message="No orders yet. Start shopping!" />
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const orderId = order._id?.slice(0, 8).toUpperCase() || "—";
                  const total = parseFloat(
                    order.totalAmount || order.total || 0
                  ).toFixed(2);
                  const date = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  return (
                    <div
                      key={order._id}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-700 font-mono tracking-wider">
                            #{orderId}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-slate-800">
                          ${total}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Bookings */}
          <section>
            <SectionHeader
              title="Recent Bookings"
              to="/customer/bookings"
              linkLabel="View all"
            />
            {recentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <MiniEmpty message="No bookings yet. Browse services!" />
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => {
                  const serviceName =
                    booking.serviceId?.name || booking.serviceName || "Service";
                  const date = booking.scheduledDate
                    ? new Date(booking.scheduledDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )
                    : "—";
                  return (
                    <div
                      key={booking._id}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center shrink-0">
                          <svg
                            className="w-4 h-4 text-violet-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {serviceName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {date}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
