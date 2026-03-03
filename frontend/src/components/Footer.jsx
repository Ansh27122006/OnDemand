import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-3">
            <span className="text-2xl font-black tracking-tight text-white">
              On<span className="text-blue-400">Demand</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed">
              One platform. Every product. Every service.
            </p>
            <p className="text-gray-600 text-xs mt-auto pt-6">
              © 2026 OnDemand. All rights reserved.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
              Quick Links
            </h3>
            {[
              { label: "Home", to: "/" },
              { label: "Browse Products", to: "/products" },
              { label: "Browse Services", to: "/services" },
              { label: "Register as Vendor", to: "/register" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-150 w-fit">
                {label}
              </Link>
            ))}
          </div>

          {/* Column 3 — Support */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">
              Support
            </h3>
            {["About Us", "Contact Us", "Privacy Policy"].map((item) => (
              <span
                key={item}
                className="text-sm text-gray-300 w-fit cursor-default">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
          <p className="text-xs text-gray-600">
            Built with ❤️ for buyers, sellers, and service providers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
