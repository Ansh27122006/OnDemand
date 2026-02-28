import { useState, useEffect } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_MAP = {
  pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
    dot: "bg-yellow-400",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 ring-1 ring-green-300",
    dot: "bg-green-500",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function BookingCard({ booking, index }) {
  const serviceName = booking.serviceId?.name ?? "Service";
  const storeName   = booking.vendorId?.storeName ?? "Unknown Store";

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Service</p>
          <h3 className="text-base font-bold text-slate-800 truncate leading-snug">{serviceName}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 grid grid-cols-2 gap-4">
        {/* Vendor */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Store</p>
            <p className="text-sm font-semibold text-slate-700 truncate leading-tight mt-0.5">{storeName}</p>
          </div>
        </div>

        {/* Scheduled date */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Scheduled</p>
            <p className="text-sm font-semibold text-slate-700 leading-tight mt-0.5">
              {booking.scheduledDate ? formatDate(booking.scheduledDate) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-100">
        <span className="text-xs text-slate-400">Total amount</span>
        <span className="text-base font-bold text-slate-900 tracking-tight">
          Rs. {booking.totalAmount}
        </span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-400">Loading your bookings…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-6 text-center px-4">
      <div className="relative">
        <div className="w-28 h-28 rounded-3xl bg-violet-50 flex items-center justify-center">
          <svg className="w-14 h-14 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">0</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-800">No bookings yet</h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          You haven't booked any services. Discover what our vendors have to offer!
        </p>
      </div>

      <Link
        to="/services"
        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm shadow-violet-200 transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Browse Services
      </Link>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-5 py-4">
      <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    axios
      .get("/api/bookings/my")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        // Newest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sorted);
      })
      .catch(() => setError("Failed to load your bookings. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
            {!loading && !error && (
              <p className="text-xs text-slate-400 mt-0.5">
                {bookings.length > 0
                  ? `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} made`
                  : "No bookings yet"}
              </p>
            )}
          </div>

          {!loading && !error && bookings.length > 0 && (
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-sm shadow-violet-300">
              {bookings.length}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {loading && <Spinner />}
        {!loading && error && <ErrorBanner message={error} />}
        {!loading && !error && bookings.length === 0 && <EmptyState />}
        {!loading && !error && bookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {bookings.map((booking, i) => (
              <BookingCard key={booking._id} booking={booking} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}