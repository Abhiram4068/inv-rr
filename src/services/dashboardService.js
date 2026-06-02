import api from './authService';

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/api/dashboard/');
    return response.data;
  }
};
