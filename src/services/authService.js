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

    // Don't attempt refresh for auth endpoints or non-401 errors
    if (error.response?.status !== 401 || isAuthEndpoint || original._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(original))
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
      // Only redirect if not already on an auth page
      if (!window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const login    = (data) => api.post("/api/login/", data);
export const logout   = ()     => api.post("/api/logout/");
export const register = (data) => api.post("/api/register/", data);

export default api;