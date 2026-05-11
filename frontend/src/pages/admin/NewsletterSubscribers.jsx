import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all subscribers on mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/newsletter");
      setSubscribers(response.data.subscribers || []);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      alert("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete subscriber
  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/newsletter/${id}`);
      setSubscribers(subscribers.filter((sub) => sub.id !== id));
      alert("Subscriber deleted successfully");
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      alert("Failed to delete subscriber");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter((sub) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (sub.name && sub.name.toLowerCase().includes(searchLower)) ||
      sub.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Newsletter Subscribers ({subscribers.length} total)
          </h1>
          <p className="mt-2 text-slate-600">
            Manage and view all newsletter subscribers on your platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Table */}
        {filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="w-full divide-y divide-slate-200 bg-white">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {subscriber.name || (
                        <span className="text-slate-500 italic">Anonymous</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {subscriber.email}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          subscriber.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                        {subscriber.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>

                    {/* Subscribed Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(subscriber.subscribedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() =>
                          handleDelete(subscriber.id, subscriber.email)
                        }
                        disabled={deletingId === subscriber.id}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          deletingId === subscriber.id
                            ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}>
                        {deletingId === subscriber.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg mb-2">No subscribers found</p>
            <p className="text-slate-500 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No one has subscribed to the newsletter yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterSubscribers;
