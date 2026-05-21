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
  },
  getDesignations: async () => {
    const response = await api.get("/api/admin/designations/");
    return response.data;
  },

  createDesignation: async (designationData) => {
    const response = await api.post("/api/admin/designations/", designationData);
    return response.data;
  },

  deleteDesignation: async (id) => {
    const response = await api.delete(`/api/admin/designations/${id}/`);
    return response.data;
  }
};

export default adminService;
