import { createContext, useState, useEffect, useCallback } from "react";
import api, { logout as logoutApi } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have an active session by fetching the profile.
    // If it fails with 401, the interceptor will attempt a token refresh automatically.
    api.get("/api/profile/")
      .then((res) => {
        setUser(res.data?.user ?? res.data ?? { authenticated: true });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch (_) {}
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};