const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE_URL + endpoint, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers }});
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
export default api;