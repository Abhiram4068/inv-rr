import api from "../api/axios";
// GET /storage/summary/
export const getStorageSummary = () => api.get(`/storage/summary/`);

