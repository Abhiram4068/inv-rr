import api from '../authService';

const userService = {
    getAllUsers: async ({ page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (search.trim()) params.append('search', search.trim());

        const response = await api.get(`/api/admin/users/?${params.toString()}`);
        return response.data; // { count, next, previous, results: [...] }
    },
     getUserDetails: async (id) => {
        const response = await api.get(
            `/api/admin/user/${id}/`
        );

        return response.data;
    },
    blockUser: async (id) => {
        const response = await api.post(`/api/admin/user/${id}/block/`);
        return response.data;
    },
    getPendingApprovals: async ({ page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (search.trim()) params.append('search', search.trim());
        
        const response = await api.get(`/api/admin/new-users/?${params.toString()}`);
        return response.data;
    },
    resolvePendingApproval: async (id, action) => {
        const response = await api.post(`/api/admin/new-users/${id}/resolve/`, { action });
        return response.data;
    },
    getReactivationRequests: async ({ page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (search.trim()) params.append('search', search.trim());
        
        const response = await api.get(`/api/admin/reactivation-request/?${params.toString()}`);
        return response.data;
    },
    resolveReactivationRequest: async (id, action, userId) => {
        const response = await api.post(`/api/auth/reactivation-request/${id}/resolve/`, { action, user_id: userId });
        return response.data;
    },
    getBlockedUsers: async ({ page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (search.trim()) params.append('search', search.trim());
        
        const response = await api.get(`/api/admin/blocked-users/?${params.toString()}`);
        return response.data;
    },
    unblockUser: async (id) => {
        const response = await api.post(`/api/admin/user/${id}/unblock/`);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api.post(`/api/admin/user/${id}/delete/`);
        return response.data;
    },
    restoreUser: async (id) => {
        const response = await api.post(`/api/admin/user/${id}/restore/`);
        return response.data;
    },
    getDeletedUsers: async ({ page = 1, search = '' } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (search.trim()) params.append('search', search.trim());
        
        const response = await api.get(`/api/admin/deleted-users/?${params.toString()}`);
        return response.data;
    },

};

export default userService;