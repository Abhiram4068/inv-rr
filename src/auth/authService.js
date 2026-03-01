export const login = async (email, password) => {};
export const logout = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');