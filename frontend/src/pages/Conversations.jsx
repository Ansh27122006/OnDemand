import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const truncate = (str = "", max = 40) =>
  str.length > max ? str.slice(0, max).trimEnd() + "…" : str;

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const roleBadgeColor = (role) => {
  const map = {
    admin: "bg-red-100 text-red-700",
    vendor: "bg-purple-100 text-purple-700",
    customer: "bg-blue-100 text-blue-700",
  };
  return map[role] ?? "bg-gray-100 text-gray-600";
};

// Avatar background — stable colour per name so it doesn't flicker on re-render
const avatarColor = (name = "") => {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Conversations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch conversations on mount ─────────────────────────────────────────
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await api.get("/chat/conversations");
        // Filter out malformed conversations
        const validConversations = (data.conversations || []).filter(
          (conv) => conv && conv._id && Array.isArray(conv.participants)
        );
        setConversations(validConversations);
      } catch (err) {
        console.error("[Conversations] fetch error:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // ── Socket: real-time inbox updates ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onConversationUpdated = (updated) => {
      // Validate the updated conversation before processing
      if (!updated || !updated._id || !Array.isArray(updated.participants)) {
        return;
      }

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === updated._id);

        const next = exists
          ? prev.map((c) => (c._id === updated._id ? updated : c))
          : [updated, ...prev]; // brand-new conversation pushed to the user

        // Keep sorted by lastMessageAt descending
        return [...next].sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );
      });
    };

    socket.on("conversation_updated", onConversationUpdated);
    return () => socket.off("conversation_updated", onConversationUpdated);
  }, [socket]);

  // ── Derive the other participant from a conversation ─────────────────────
  const getOther = (conversation) => {
    if (!conversation?.participants?.length) return null;
    return conversation.participants.find(
      (p) => p && p._id && p._id.toString() !== user._id.toString()
    );
  };

  // ── Unread count for the current user ────────────────────────────────────
  const getUnread = (conversation) => {
    // unreadCount arrives as a plain object from JSON (Map serialises to {})
    const counts = conversation.unreadCount;
    if (!counts) return 0;
    // Handle both plain object and Map-like structure
    return typeof counts.get === "function"
      ? counts.get(user._id.toString()) || 0
      : counts[user._id.toString()] || 0;
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading messages…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Messages</h1>
      </header>

      {/* ── CONVERSATION LIST ───────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto py-3 px-2">
        {conversations.length === 0 ? (
          /* ── Empty state ────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.09-3.27C3.4 15.46 3 13.77 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No conversations yet</p>
            <p className="text-gray-400 text-sm">
              Start chatting by visiting a vendor or user profile.
            </p>
          </div>
        ) : (
          /* ── Conversation cards ─────────────────────────────────────── */
          <ul className="divide-y divide-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden">
            {conversations.map((conv) => {
              const other = getOther(conv);
              const unread = getUnread(conv);
              const online = other ? isOnline(other._id.toString()) : false;

              if (!other) return null; // safety — skip malformed conversations

              return (
                <li key={conv._id}>
                  <button
                    onClick={() => navigate(`/chat/${other._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3.5
                               hover:bg-gray-50 active:bg-gray-100
                               transition-colors text-left">
                    {/* ── Avatar ──────────────────────────────────────── */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center
                                    text-white font-semibold text-sm ${avatarColor(
                                      other.name
                                    )}`}>
                        {getInitials(other.name)}
                      </div>

                      {/* Online dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                    ${online ? "bg-green-400" : "bg-gray-300"}`}
                        title={online ? "Online" : "Offline"}
                      />
                    </div>

                    {/* ── Content ─────────────────────────────────────── */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: name + time */}
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`font-semibold text-gray-800 truncate text-sm
                                        ${unread > 0 ? "font-bold" : ""}`}>
                            {other.name}
                          </span>

                          {/* Role badge */}
                          {other.role && (
                            <span
                              className={`shrink-0 text-xs font-medium px-2 py-0.5
                                          rounded-full ${roleBadgeColor(
                                            other.role
                                          )}`}>
                              {other.role.charAt(0).toUpperCase() +
                                other.role.slice(1)}
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-gray-400">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>

                      {/* Row 2: last message preview + unread badge */}
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            unread > 0
                              ? "text-gray-800 font-medium"
                              : "text-gray-400"
                          }`}>
                          {conv.lastMessage
                            ? truncate(conv.lastMessage, 40)
                            : "No messages yet"}
                        </p>

                        {/* Unread badge */}
                        {unread > 0 && (
                          <span
                            className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full
                                       bg-blue-500 text-white text-xs font-bold
                                       flex items-center justify-center">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
