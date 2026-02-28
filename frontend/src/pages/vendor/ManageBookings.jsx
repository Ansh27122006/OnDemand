import { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_STYLES = {
  pending: {
    badge: 'bg-amber-100 text-amber-700 border border-amber-300',
    dot: 'bg-amber-400',
  },
  confirmed: {
    badge: 'bg-blue-100 text-blue-700 border border-blue-300',
    dot: 'bg-blue-400',
  },
  completed: {
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
    dot: 'bg-emerald-400',
  },
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// ── Spinner ────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
      <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
    </div>
    <p className="text-sm text-slate-400 tracking-wide font-medium">Loading bookings…</p>
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-28 gap-5">
    <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
      <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div className="text-center">
      <p className="text-lg font-semibold text-slate-700">No bookings yet</p>
      <p className="text-sm text-slate-400 mt-1 max-w-xs">
        When customers book your services, they'll show up here. Sit tight!
      </p>
    </div>
  </div>
);

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
};

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, onDismiss }) => (
  <div
    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in-up"
  >
    <span className="w-5 h-5 flex-shrink-0 rounded-full bg-emerald-400 flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    {message}
    <button onClick={onDismiss} className="ml-2 text-slate-400 hover:text-white transition-colors">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // bookingId being updated
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/vendor');
        setBookings(data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      showToast(`Booking marked as "${newStatus}" successfully.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Bookings</h1>
            {!loading && (
              <p className="text-sm text-slate-500 mt-0.5">
                {bookings.length === 0
                  ? 'No bookings found'
                  : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} total`}
              </p>
            )}
          </div>

          {/* Legend */}
          {!loading && bookings.length > 0 && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
              {Object.entries(STATUS_STYLES).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1.5 capitalize">
                  <span className={`w-2 h-2 rounded-full ${val.dot}`} />
                  {key}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <Spinner />
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Customer', 'Service', 'Scheduled Date', 'Amount', 'Status', 'Update Status'].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking, idx) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-50/70 transition-colors duration-150"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {booking.customerId?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {booking.customerId?.name || '—'}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                              {booking.customerId?.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                          {booking.serviceId?.name || '—'}
                        </span>
                      </td>

                      {/* Scheduled Date */}
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(booking.scheduledDate)}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        {formatAmount(booking.totalAmount)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <StatusBadge status={booking.status} />
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={booking.status}
                            disabled={updating === booking._id}
                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                            className="appearance-none w-full pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 cursor-pointer hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                            {updating === booking._id ? (
                              <svg className="w-3.5 h-3.5 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Notification ── */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
