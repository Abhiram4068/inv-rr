import api from '../api/axios';

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard/');
    return response.data;
  },
};
