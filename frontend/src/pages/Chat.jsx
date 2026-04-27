import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const roleBadgeColor = (role) => {
  const map = {
    admin: "bg-red-100 text-red-700",
    vendor: "bg-purple-100 text-purple-700",
    customer: "bg-blue-100 text-blue-700",
  };
  return map[role] ?? "bg-gray-100 text-gray-600";
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Chat() {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isOnline } = useSocket();

  // Normalise user id — backend may serialise as 'id' or '_id'
  const userId = user?._id || user?.id;

  // ── Core chat state ───────────────────────────────────────────────────────
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false); // other user typing

  // ── Refs ──────────────────────────────────────────────────────────────────
  const bottomRef = useRef(null); // scroll anchor
  const typingTimer = useRef(null); // debounce handle
  const roomIdRef = useRef(null); // stable roomId for socket callbacks

  // ── 1-5: Initialise conversation on mount ────────────────────────────────
  useEffect(() => {
    if (!user || !receiverId) return;

    const init = async () => {
      try {
        setLoading(true);

        // 1 & 2 — Get or create conversation
        const { data: convData } = await api.post("/chat/conversation", {
          receiverId,
        });
        const conv = convData.conversation;
        setConversation(conv);
        roomIdRef.current = conv.roomId;

        // Derive the receiver object from participants
        const other = conv.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );
        setReceiver(other);

        // 3 — Load message history
        const { data: msgData } = await api.get(
          `/chat/messages/${conv.roomId}`
        );
        setMessages(msgData.messages);

        // 4 — Join socket room
        if (socket) {
          socket.emit("join_room", { roomId: conv.roomId, userId });
        }

        // 5 — Mark existing messages as read
        await api.put(`/chat/read/${conv.roomId}`);
      } catch (err) {
        console.error("[Chat] init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Leave room on unmount
    return () => {
      if (socket && roomIdRef.current) {
        socket.emit("typing", {
          roomId: roomIdRef.current,
          userId,
          isTyping: false,
        });
      }
      clearTimeout(typingTimer.current);
    };
  }, [user, receiverId, socket]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // New message arrives → append to list
    const onReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Other user typing status
    const onUserTyping = ({ userId: typingUserId, isTyping: typing }) => {
      if (typingUserId !== userId?.toString()) {
        setIsTyping(typing);
      }
    };

    // Messages were read by the other user → mark our sent messages as read
    const onMessagesRead = () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId?._id?.toString() === userId?.toString() ||
          m.senderId?.toString() === userId?.toString()
            ? { ...m, isRead: true }
            : m
        )
      );
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("messages_read", onMessagesRead);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("messages_read", onMessagesRead);
    };
  }, [socket, userId]);

  // ── Auto-scroll to bottom on new messages ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Typing debounce ───────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (!socket || !roomIdRef.current) return;

    // Emit isTyping=true immediately on keystroke
    socket.emit("typing", {
      roomId: roomIdRef.current,
      userId,
      isTyping: true,
    });

    // Reset the 1.5 s debounce timer
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", {
        roomId: roomIdRef.current,
        userId,
        isTyping: false,
      });
    }, 1500);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !socket || !conversation) return;

    socket.emit("send_message", {
      roomId: conversation.roomId,
      senderId: userId,
      receiverId,
      text,
      conversationId: conversation._id,
    });

    // Stop typing indicator immediately on send
    clearTimeout(typingTimer.current);
    socket.emit("typing", {
      roomId: conversation.roomId,
      userId,
      isTyping: false,
    });

    setInputText("");
    // ⚠️  Do NOT push to messages here — wait for 'receive_message' event
  }, [inputText, socket, conversation, userId, receiverId]);

  // Allow Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isMine = (msg) => {
    const sid = msg.senderId?._id ?? msg.senderId;
    return sid?.toString() === userId?.toString();
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading conversation…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {receiver?.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>

        {/* Name + role + online status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 truncate">
              {receiver?.name ?? "Unknown User"}
            </span>

            {/* Online indicator dot */}
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOnline(receiverId) ? "bg-green-400" : "bg-gray-300"
              }`}
              title={isOnline(receiverId) ? "Online" : "Offline"}
            />
          </div>

          {/* Role badge */}
          {receiver?.role && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColor(
                receiver.role
              )}`}>
              {receiver.role.charAt(0).toUpperCase() + receiver.role.slice(1)}
            </span>
          )}
        </div>
      </header>

      {/* ── MESSAGES AREA ──────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-10">
            No messages yet. Say hello! 👋
          </p>
        )}

        {messages.map((msg, idx) => {
          const mine = isMine(msg);
          const senderName = msg.senderId?.name ?? "Unknown";
          const showName = !mine;

          return (
            <div
              key={msg._id ?? idx}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {/* Sender name (only for their messages) */}
              {showName && (
                <span className="text-xs text-gray-500 mb-1 ml-1">
                  {senderName}
                </span>
              )}

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  mine
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                }`}>
                {msg.text}
              </div>

              {/* Timestamp + read receipt */}
              <div
                className={`flex items-center gap-1 mt-1 ${
                  mine ? "flex-row-reverse" : ""
                }`}>
                <span className="text-xs text-gray-400">
                  {formatTime(msg.createdAt)}
                </span>

                {/* Double-tick read receipt for sent messages */}
                {mine && (
                  <svg
                    className={`w-4 h-4 ${
                      msg.isRead ? "text-blue-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M18 7l-1.4-1.4-6.6 6.6-2.6-2.6L6 11l4 4 8-8zm-4 0l-1.4-1.4-3 3 1.4 1.4 3-3z" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
            <span className="text-xs text-gray-400 self-end mb-1">
              {receiver?.name ?? "User"} is typing…
            </span>
          </div>
        )}

        {/* Invisible scroll anchor */}
        <div ref={bottomRef} />
      </main>

      {/* ── INPUT AREA ─────────────────────────────────────────────────── */}
      <footer className="px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400
                       max-h-32 overflow-y-auto leading-relaxed"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600
                       disabled:bg-gray-200 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors shadow-sm"
            aria-label="Send message">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-1.5 ml-1">
          Press <kbd className="bg-gray-100 px-1 rounded">Enter</kbd> to send,{" "}
          <kbd className="bg-gray-100 px-1 rounded">Shift + Enter</kbd> for new
          line
        </p>
      </footer>
    </div>
  );
}
