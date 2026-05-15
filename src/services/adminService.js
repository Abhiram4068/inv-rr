import api from './authService';

const adminService = {
  getStats: async () => {
    const response = await api.get("/api/admin/stats/");
    return response.data;
  },
  
  getReactivationRequests: async () => {
    const response = await api.get("/api/admin/reactivation-requests/");
    return response.data;
  },
  
  resolveReactivationRequest: async (id, action) => {
    const response = await api.post(`/api/admin/reactivation-requests/${id}/resolve/`, { action });
    return response.data;
  }
};

export default adminService;
