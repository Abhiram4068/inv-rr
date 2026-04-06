import { createContext, useState, useEffect, useCallback } from "react";
import api, { logout as logoutApi } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On every app load/refresh, hit the refresh endpoint.
    // If the refresh cookie is alive → we're authenticated.
    // If not → cookies are gone, user must log in.
    api.post("/api/token/refresh/")
      .then((res) => {
        // If your refresh endpoint returns user info, store it.
        // If it only returns a new access token, just mark as authenticated.
        setUser(res.data?.user ?? { authenticated: true });
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