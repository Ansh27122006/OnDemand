import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

/* ── Toast Notification ── */
const Toast = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 text-white text-sm font-medium rounded-2xl shadow-2xl animate-slide-up ${
      type === "success" ? "bg-slate-900" : "bg-red-600"
    }`}>
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        type === "success" ? "bg-green-400" : "bg-white/30"
      }`}>
      {type === "success" ? (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
    </div>
    {message}
    <button
      onClick={onClose}
      className="ml-2 text-white/60 hover:text-white transition-colors">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

/* ── Loading Spinner ── */
const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading service...</p>
  </div>
);

/* ── Error State ── */
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
      <svg
        className="w-8 h-8 text-red-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
        />
      </svg>
    </div>
    <div>
      <p className="text-slate-700 font-bold text-lg">Service Not Found</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
    </div>
    <Link
      to="/services"
      className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
      ← Back to Services
    </Link>
  </div>
);

/* ── Booking Success Banner ── */
const BookingSuccess = ({ service, date }) => (
  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div>
        <p className="text-green-800 font-bold text-sm">Booking Confirmed!</p>
        <p className="text-green-600 text-xs mt-0.5">
          You'll receive a confirmation shortly.
        </p>
      </div>
    </div>
    <div className="bg-white border border-green-100 rounded-xl p-4 text-sm space-y-1.5">
      <div className="flex justify-between">
        <span className="text-slate-500">Service</span>
        <span className="font-semibold text-slate-800">{service}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Scheduled</span>
        <span className="font-semibold text-slate-800">
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
    <Link
      to="/my-bookings"
      className="text-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
      View My Bookings →
    </Link>
  </div>
);

/* ── Detail Row ── */
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 text-blue-500">
      {icon}
    </div>
    <div>
      <span className="text-slate-400 text-xs">{label}</span>
      <p className="text-slate-700 font-semibold">{value}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   ServiceDetail Page
══════════════════════════════════════════ */
const ServiceDetail = () => {
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state
  const [scheduledDate, setScheduledDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [toast, setToast] = useState(null);

  // Fetch service on mount
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const data = res.data.service || res.data;
        setService(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? "This service does not exist or has been removed."
            : "Failed to load service. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Min date = today (no past bookings)
  const today = new Date().toISOString().split("T")[0];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!scheduledDate) {
      setBookingError("Please select a date to proceed.");
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      await api.post("/bookings", {
        serviceId: id,
        scheduledDate,
      });
      setBookingSuccess(true);
      setToast({ message: "Booking confirmed successfully!", type: "success" });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Booking failed. Please try again.";
      setBookingError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!service) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <svg
            className="w-4 h-4"
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
          <Link
            to="/services"
            className="hover:text-blue-600 transition-colors">
            Services
          </Link>
          <svg
            className="w-4 h-4"
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
          <span className="text-slate-600 font-medium truncate max-w-[200px]">
            {service.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Left: Service Info ── */}
          <div className="flex flex-col gap-5">
            {/* Header card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Decorative top strip */}
              <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="p-6 flex flex-col gap-4">
                {/* Category badge */}
                {service.category && (
                  <span className="self-start px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                    {service.category}
                  </span>
                )}

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {service.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600">
                    ${parseFloat(service.price || 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-400 font-medium">
                    / session
                  </span>
                </div>

                {/* Quick details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {service.duration && (
                    <DetailRow
                      label="Duration"
                      value={`${service.duration} minutes`}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                          />
                        </svg>
                      }
                    />
                  )}
                  {service.location && (
                    <DetailRow
                      label="Location"
                      value={service.location}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      }
                    />
                  )}
                  {service.vendorId?.storeName && (
                    <DetailRow
                      label="Provider"
                      value={service.vendorId.storeName}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64"
                          />
                        </svg>
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  About This Service
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            {/* Back link */}
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Services
            </Link>
          </div>

          {/* ── Right: Booking Panel ── */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-black text-slate-900 mb-1">
                Book This Service
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Select your preferred date to schedule a session.
              </p>

              {/* Show success or booking form */}
              {bookingSuccess ? (
                <BookingSuccess
                  service={service.name}
                  date={scheduledDate}
                />
              ) : (
                <form
                  onSubmit={handleBooking}
                  className="flex flex-col gap-5">
                  {/* Date picker */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
                      <input
                        type="date"
                        value={scheduledDate}
                        min={today}
                        onChange={(e) => {
                          setScheduledDate(e.target.value);
                          if (bookingError) setBookingError("");
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                      />
                    </div>
                    {bookingError && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                          />
                        </svg>
                        {bookingError}
                      </p>
                    )}
                  </div>

                  {/* Booking summary */}
                  {scheduledDate && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-2">
                      <p className="font-bold text-blue-800 text-xs uppercase tracking-wider mb-2">
                        Booking Summary
                      </p>
                      <div className="flex justify-between text-slate-600">
                        <span>Service</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">
                          {service.name}
                        </span>
                      </div>
                      {service.duration && (
                        <div className="flex justify-between text-slate-600">
                          <span>Duration</span>
                          <span className="font-semibold text-slate-800">
                            {service.duration} min
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Date</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(
                            scheduledDate + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 flex justify-between">
                        <span className="font-bold text-slate-700">Total</span>
                        <span className="font-black text-blue-600">
                          ${parseFloat(service.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={bookingLoading || !scheduledDate}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
                    {bookingLoading ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth={4}
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5"
                          />
                        </svg>
                        Confirm Booking
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Free cancellation up to 24 hours before your session
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Slide-up animation ── */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(1rem); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>
    </div>
  );
};

export default ServiceDetail;
