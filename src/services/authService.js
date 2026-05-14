import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// Endpoints that should never trigger a refresh attempt
const AUTH_ENDPOINTS = ["/api/login/", "/api/token/refresh/", "/api/register/"];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) =>
      original.url?.includes(ep)
    );

    const isOnAuthPage = window.location.pathname.startsWith("/login") || 
                         window.location.pathname.startsWith("/register");

    // Don't attempt refresh for auth endpoints, non-401 errors, or if already on an auth page
    if (error.response?.status !== 401 || isAuthEndpoint || original._retry || isOnAuthPage) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          original._retry = true;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post("/api/token/refresh/");
      processQueue(null);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      // Let AuthContext handle the redirection to prevent hard jumps
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const login    = (data) => api.post("/api/auth/login/", data);
export const logout   = ()     => api.post("/api/auth/logout/");
export const register = (data) => api.post("/api/auth/register/", data);
export const profile = () => api.get("/api/profile/");
export const getDesignations = () => api.get("/api/designations/");
export const updateProfile = (data) => api.patch("/api/profile/", data);
export const changePassword = (data) => api.post("/api/auth/change-password/", data);
export const forgotPassword = (data) => {
  return api.post("/api/auth/forgot-password/", data);
};

export const resetPassword = ({ uid, token, new_password, confirm_password }) => {
  return api.post("/api/auth/reset-password/confirm/", {
    uid,
    token,
    new_password,
    confirm_password,
  });
};

export default api;