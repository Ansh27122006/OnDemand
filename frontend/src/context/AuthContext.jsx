import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — restore session from localStorage if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("vendorlink_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (error) {
        // Token is invalid or expired — clean up
        console.error("Session restore failed:", error.message);
        localStorage.removeItem("vendorlink_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Save token to localStorage and update state
  const login = (userData, userToken) => {
    localStorage.setItem("vendorlink_token", userToken);
    setToken(userToken);
    setUser(userData);
  };

  // Remove token from localStorage and clear state
  const logout = () => {
    localStorage.removeItem("vendorlink_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
