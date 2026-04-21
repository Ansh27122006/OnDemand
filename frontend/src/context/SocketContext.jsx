import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

// ── Derive the base server URL (strip /api suffix) ──────────────────────────
// VITE_API_URL is something like 'http://localhost:5000/api'
// Socket.io must connect to the root: 'http://localhost:5000'
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

// ────────────────────────────────────────────────────────────────────────────

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // ── Only connect when a user is authenticated ────────────────────────
    if (!user) {
      // If a stale socket exists (e.g. after logout), tear it down
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineUsers(new Set());
      }
      return;
    }

    // ── Create socket connection ─────────────────────────────────────────
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // skip long-polling for lower latency
      reconnectionAttempts: 5, // retry up to 5 times on drop
      reconnectionDelay: 1000, // 1 s between retries
    });

    // ── Global presence listeners ────────────────────────────────────────

    // Another user joined a room → mark them online
    newSocket.on("user_joined", ({ userId }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    // A user disconnected → remove them from the online set
    newSocket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on("connect", () => {
      console.log("[socket] connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[socket] connection error:", error.message);
    });

    setSocket(newSocket);

    // ── Cleanup: disconnect when user logs out or component unmounts ─────
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers(new Set());
    };
  }, [user]); // re-runs when user logs in or out

  // ── Convenience helper ───────────────────────────────────────────────────
  const isOnline = (userId) => onlineUsers.has(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

// ── Custom hook ──────────────────────────────────────────────────────────────
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
