import { useState, useEffect } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics");
      setAnalytics(response.data.analytics || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSnapshot = async () => {
    try {
      setSaving(true);
      await api.post("/analytics/snapshot");
      setSuccessMessage("Today's snapshot saved!");
      await fetchAnalytics();
    } catch (err) {
      setError("Failed to save snapshot");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Math.round(amount).toLocaleString("en-IN")}`;
  };

  const latestSnapshot = analytics.length > 0 ? analytics[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Analytics
          </h1>
          <p className="text-gray-600">
            Daily snapshot of platform statistics and performance
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Save Snapshot Button */}
        <div className="mb-8">
          <button
            onClick={handleSaveSnapshot}
            disabled={saving}
            title="Click to record today's platform statistics to PostgreSQL"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
            {saving ? "Saving..." : "Save Today's Snapshot"}
          </button>
        </div>

        {/* Summary Cards */}
        {latestSnapshot && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Latest Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Latest Revenue
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(latestSnapshot.totalRevenue)}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {formatDate(latestSnapshot.date)}
              </p>
            </div>

            {/* Latest Orders Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Latest Orders
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {latestSnapshot.totalOrders}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {formatDate(latestSnapshot.date)}
              </p>
            </div>

            {/* Latest New Users Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium mb-2">
                Latest New Users
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {latestSnapshot.newUsers}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {formatDate(latestSnapshot.date)}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : analytics.length === 0 ? (
          /* Empty State */
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">
              No snapshots yet. Click Save Today Snapshot to begin.
            </p>
          </div>
        ) : (
          /* Analytics Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Revenue (Rs.)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      New Users
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      New Vendors
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Bookings
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 ${
                        index === 0 ? "bg-blue-50" : ""
                      } hover:bg-gray-50 transition-colors`}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(item.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.totalOrders}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.newUsers}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.newVendors}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.totalBookings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;
