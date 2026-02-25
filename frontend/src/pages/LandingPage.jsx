import { Link } from "react-router-dom";

/* ── Feature card data ── */
const features = [
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
        />
      </svg>
    ),
    title: "Buy Products",
    description:
      "Discover thousands of products from verified vendors. Filter by category, price, and ratings to find exactly what you need — delivered to your door.",
    accent: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
    title: "Book Services",
    description:
      "From home repairs to professional consulting — browse service providers, check availability, and book appointments in just a few clicks.",
    accent: "bg-indigo-50 text-indigo-600",
    border: "hover:border-indigo-200",
  },
  {
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
        />
      </svg>
    ),
    title: "Trusted Vendors",
    description:
      "Every vendor is manually reviewed and approved by our team. Real reviews, verified credentials, and a transparent rating system you can rely on.",
    accent: "bg-sky-50 text-sky-600",
    border: "hover:border-sky-200",
  },
];

/* ── Stats ── */
const stats = [
  { value: "2,400+", label: "Active Vendors" },
  { value: "18,000+", label: "Products Listed" },
  { value: "95%", label: "Satisfaction Rate" },
  { value: "40+", label: "Categories" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:bg-blue-700 transition-colors">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              On<span className="text-blue-600">Demand</span>
            </span>
          </Link>

          {/* Nav actions */}
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            The All-in-One Vendor Marketplace
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
            One Platform.
            <br />
            <span className="text-blue-400">Every Vendor.</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed mb-10">
            OnDemand connects customers with trusted vendors offering products
            and services. Browse, compare, book, and buy — all in one integrated
            digital marketplace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 text-sm">
              Browse Products
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-bold rounded-xl backdrop-blur transition-all hover:-translate-y-0.5 text-sm">
              Join as Vendor →
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-blue-600 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-slate-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-bold uppercase tracking-widest mb-3">
              Why OnDemand
            </p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Everything you need, in one place
            </h2>
            <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
              Whether you're shopping for goods or booking a service, OnDemand
              has you covered.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`bg-white rounded-2xl p-8 border border-slate-200 ${f.border} shadow-sm hover:shadow-md transition-all duration-200 group`}>
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.accent}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-blue-600 py-20 px-6 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Ready to grow your business?
        </h2>
        <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
          Join thousands of vendors already thriving on OnDemand. Setup takes
          less than 5 minutes.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
          Start Selling Today
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-black text-lg tracking-tight">
            On<span className="text-blue-400">Demand</span>
          </span>
          <p className="text-sm">
            © {new Date().getFullYear()} OnDemand. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm">
            <Link
              to="/login"
              className="hover:text-white transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="hover:text-white transition-colors">
              Register
            </Link>
            <Link
              to="/products"
              className="hover:text-white transition-colors">
              Products
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
