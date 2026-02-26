import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── Role-based nav config ── */
const navConfig = {
  customer: {
    links: [
      { label: "Browse Products", to: "/products" },
      { label: "Browse Services", to: "/services" },
    ],
    dropdown: [
      { label: "My Orders", to: "/my-orders" },
      { label: "My Bookings", to: "/my-bookings" },
    ],
  },
  vendor: {
    links: [{ label: "My Dashboard", to: "/vendor/dashboard" }],
    dropdown: [
      { label: "Manage Products", to: "/vendor/products" },
      { label: "Manage Services", to: "/vendor/services" },
    ],
  },
  admin: {
    links: [],
    dropdown: [{ label: "Admin Dashboard", to: "/admin/dashboard" }],
  },
};

/* ── Chevron icon ── */
const ChevronDown = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${
      open ? "rotate-180" : ""
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

/* ── Hamburger icon ── */
const HamburgerIcon = ({ open }) => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}>
    {open ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    )}
  </svg>
);

/* ── Avatar initials ── */
const Avatar = ({ name }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center select-none">
      {initials}
    </div>
  );
};

/* ══════════════════════════════════════════
   Main Navbar Component
══════════════════════════════════════════ */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dropdownRef = useRef(null);

  const config = user ? navConfig[user.role] : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const handleNavClick = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNavClick();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
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

        {/* ── Desktop Center Nav Links ── */}
        {config?.links.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {config.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* ── Desktop Right Side ── */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {/* NOT logged in */}
          {!user && (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                Register
              </Link>
            </>
          )}

          {/* Logged in — user dropdown */}
          {user && (
            <div
              className="relative"
              ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <Avatar name={user.name} />
                <span className="text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown open={dropdownOpen} />
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
                  {/* User info header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-600 capitalize">
                      {user.role}
                    </span>
                  </div>

                  {/* Dropdown links */}
                  {config.dropdown.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      {item.label}
                    </Link>
                  ))}

                  {/* Divider + Logout */}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ml-auto"
          aria-label="Toggle menu">
          <HamburgerIcon open={mobileOpen} />
        </button>
      </div>

      {/* ══════════════════════════════════════
          Mobile Menu
      ══════════════════════════════════════ */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg">
          {/* NOT logged in */}
          {!user && (
            <>
              <Link
                to="/login"
                onClick={handleNavClick}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="block px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center">
                Register
              </Link>
            </>
          )}

          {/* Logged in */}
          {user && (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-3">
                <Avatar name={user.name} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user.name}
                  </p>
                  <span className="text-xs font-bold text-blue-600 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Nav links */}
              {config.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}

              {/* Dropdown items */}
              {config.dropdown.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  {item.label}
                </Link>
              ))}

              {/* Logout */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
