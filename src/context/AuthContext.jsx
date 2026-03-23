import { createContext, useState, useEffect, useCallback } from "react";
import {  logout as logoutApi } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);  // true while cookie check runs



const login = useCallback((userData) => setUser(userData), []);;

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