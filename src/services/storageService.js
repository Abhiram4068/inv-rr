import api from "../api/axios";
// GET /storage/summary/
export const getStorageSummary = () => api.get(`/storage/summary/`);

export const getStorageFiles = (params) => {
    return api.get('/storage/manage/', { params });
};

export const permanentDeleteFiles = (file_ids) => {
    return api.post('/storage/permanent-delete/', { file_ids });
};
