import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const PLACEHOLDER = "https://placehold.co/600x400?text=No+Image";

const getDiscountedPrice = (service) => {
  const productDiscount = service.discountPercentage || 0;
  const storeDiscount = service.vendorId?.onSale ? (service.vendorId.salePercentage || 0) : 0;
  const effectiveDiscount = Math.max(productDiscount, storeDiscount);
  if (effectiveDiscount === 0) return { finalPrice: service.price, discount: 0, isStoreSale: false };
  const finalPrice = Math.round(service.price - (service.price * effectiveDiscount / 100));
  return { finalPrice, discount: effectiveDiscount, isStoreSale: service.vendorId?.onSale && storeDiscount >= productDiscount };
};

const Toast = ({ message, type = "success", onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 text-white text-sm font-medium rounded-2xl shadow-2xl animate-slide-up ${
    type === "success" ? "bg-slate-900" : "bg-red-600"
  }`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${type === "success" ? "bg-green-400" : "bg-white/30"}`}>
      {type === "success" ? (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </div>
    {message}
    <button onClick={onClose} className="ml-2 text-white/60 hover:text-white transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const Spinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-400 font-medium">Loading service...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
      <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    </div>
    <div>
      <p className="text-slate-700 font-bold text-lg">Service Not Found</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
    </div>
    <Link to="/services" className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
      ← Back to Services
    </Link>
  </div>
);

const BookingSuccess = ({ service, date }) => (
  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-green-800 font-bold text-sm">Booking Confirmed!</p>
        <p className="text-green-600 text-xs mt-0.5">You'll receive a confirmation shortly.</p>
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
          {new Date(date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
    <Link to="/customer/bookings" className="text-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors">
      View My Bookings →
    </Link>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 text-blue-500">{icon}</div>
    <div>
      <span className="text-slate-400 text-xs">{label}</span>
      <p className="text-slate-700 font-semibold">{value}</p>
    </div>
  </div>
);

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [toast, setToast] = useState(null);

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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const today = new Date().toISOString().split("T")[0];

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!scheduledDate) { setBookingError("Please select a date to proceed."); return; }
    setBookingLoading(true);
    setBookingError("");
    try {
      await api.post("/bookings", { serviceId: id, scheduledDate });
      setBookingSuccess(true);
      setToast({ message: "Booking confirmed successfully!", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      setBookingError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Share handlers ──────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: "Link copied to clipboard!", type: "success" });
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({ message: "Failed to copy link", type: "error" });
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent("Check out this service: " + window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check this out: " + window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!service) return null;

  const { finalPrice, discount, isStoreSale } = getDiscountedPrice(service);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-600 font-medium truncate max-w-[200px]">{service.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Service Info */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {(() => {
                const image = service.images?.[0] || service.image || PLACEHOLDER;
                return (
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img src={image} alt={service.name} onError={(e) => { e.target.src = PLACEHOLDER; }} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                    {discount > 0 && (
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                          {discount}% OFF
                        </span>
                        {isStoreSale && (
                          <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-sm">
                            STORE SALE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="p-6 flex flex-col gap-4">
                {service.category && (
                  <span className="self-start px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                    {service.category}
                  </span>
                )}

                {/* Title row with Share button */}
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{service.name}</h1>

                  {/* Share button group */}
                  <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    {/* Copy link */}
                    <button
                      onClick={handleCopyLink}
                      title="Copy link"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      <span className="hidden sm:inline">Share</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={handleShareWhatsApp}
                      title="Share on WhatsApp"
                      className="flex items-center justify-center w-7 h-7 text-emerald-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg transition-all shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>

                    {/* Twitter / X */}
                    <button
                      onClick={handleShareTwitter}
                      title="Share on Twitter"
                      className="flex items-center justify-center w-7 h-7 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  {discount > 0 ? (
                    <>
                      <span className="text-3xl font-black text-green-600">₹{finalPrice.toFixed(2)}</span>
                      <span className="text-xl text-slate-400 line-through font-medium">₹{parseFloat(service.price).toFixed(2)}</span>
                      <span className="text-sm text-slate-400 font-medium">/ session</span>
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 text-sm font-bold rounded-full border border-red-100">{discount}% OFF</span>
                      {isStoreSale && (
                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-sm font-bold rounded-full border border-orange-100">STORE SALE</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-blue-600">₹{parseFloat(service.price || 0).toFixed(2)}</span>
                      <span className="text-sm text-slate-400 font-medium">/ session</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {service.duration && (
                    <DetailRow
                      label="Duration"
                      value={`${service.duration} ${service.duration === 1 ? "hour" : "hours"}`}
                      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg>}
                    />
                  )}
                  {service.location && (
                    <DetailRow
                      label="Location"
                      value={service.location}
                      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
                    />
                  )}
                  {service.vendorId?.storeName && (
                    <DetailRow
                      label="Provider"
                      value={service.vendorId.storeName}
                      icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64" /></svg>}
                    />
                  )}
                </div>
              </div>
            </div>

            {service.description && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About This Service</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            )}

            <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Services
            </Link>
          </div>

          {/* Right: Booking Panel */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-black text-slate-900 mb-1">Book This Service</h2>
              <p className="text-slate-400 text-sm mb-6">Select your preferred date to schedule a session.</p>

              {bookingSuccess ? (
                <BookingSuccess service={service.name} date={scheduledDate} />
              ) : (
                <form onSubmit={handleBooking} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Date</label>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <input
                        type="date"
                        value={scheduledDate}
                        min={today}
                        onChange={(e) => { setScheduledDate(e.target.value); if (bookingError) setBookingError(""); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                      />
                    </div>
                    {bookingError && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
                        {bookingError}
                      </p>
                    )}
                  </div>

                  {scheduledDate && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm space-y-2">
                      <p className="font-bold text-blue-800 text-xs uppercase tracking-wider mb-2">Booking Summary</p>
                      <div className="flex justify-between text-slate-600">
                        <span>Service</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate">{service.name}</span>
                      </div>
                      {service.duration && (
                        <div className="flex justify-between text-slate-600">
                          <span>Duration</span>
                          <span className="font-semibold text-slate-800">{service.duration} {service.duration === 1 ? "hour" : "hours"}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Date</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(scheduledDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Original Price</span>
                          <span className="text-slate-400 line-through">₹{parseFloat(service.price).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-2 flex justify-between">
                        <span className="font-bold text-slate-700">Total</span>
                        <span className="font-black text-blue-600">₹{finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || !scheduledDate}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-sm transition-colors">
                    {bookingLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0v-7.5" />
                        </svg>
                        Confirm Booking
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400">Free cancellation up to 24 hours before your session</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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