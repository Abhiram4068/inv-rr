import axios from "axios";

const api = axios.create({
  // In dev, use Vite proxy (/api) to avoid cross-origin cookie issues.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Endpoints that should never trigger a refresh attempt
const AUTH_ENDPOINTS = ["/login/", "/token/refresh/", "/register/"];

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
      await api.post("/token/refresh/");
      processQueue(null);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      // We rely on AuthContext or ProtectedRoute to handle redirection
      // to avoid hard jumps during transient errors or page refreshes.
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;