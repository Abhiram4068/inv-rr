import api from "../api/axios";


export const register = (data) => api.post("/register/", data);

// POST /login/   → Django sets HttpOnly cookie in response
export const login = (data) => api.post("/login/", data);

// POST /logout/  → Django clears cookie (add this view if you haven't)
export const logout = () => api.post("/logout/");
