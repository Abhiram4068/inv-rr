import { createContext, useState, useEffect, useCallback } from "react";
import { logout as logoutApi } from "../services/authService";

export const AuthContext = createContext(null);
const AUTH_USER_KEY = "auth_user";

const readCachedUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_) {
    return null;
  }
};

const writeCachedUser = (user) => {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_USER_KEY);
      return;
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (_) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => readCachedUser());
  const [loading, setLoading] = useState(true);

  // Restore cached user on refresh (cookie remains backend source of truth).
  useEffect(() => {
    setUser(readCachedUser());
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    writeCachedUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch (_) {}
    setUser(null);
    writeCachedUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};