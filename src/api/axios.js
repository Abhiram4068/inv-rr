import axios from "axios";

const api = axios.create({
  // In dev, use Vite proxy (/api) to avoid cross-origin cookie issues.
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default api;