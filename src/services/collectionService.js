import api from "../api/axios";

export const getCollections = (search = "", sortBy = "created_at", sortOrder = "desc") => 
  api.get("/collections/", { params: { search, sort_by: sortBy, sort_order: sortOrder } });

//GET /collections/:id/
export const getCollectionById = (collectionId) => api.get(`/collections/${collectionId}/`);

//POST /collections/
export const createCollection = (collectionData) => api.post("/collections/", collectionData);

//PATCH /collections/:id/
export const updateCollection = (collectionId, collectionData) => api.patch(`/collections/${collectionId}/`, collectionData);

//DELETE /collections/:id/
export const deleteCollection = (collectionId) => api.delete(`/collections/${collectionId}/`);

//POST /collections/:id/add-file/
export const addFileToCollection = (collectionId, fileId) => api.post(`/collections/${collectionId}/files/${fileId}/`);

//POST /collections/:id/remove-file/
export const removeFileFromCollection = (collectionId, fileId) => api.post(`/collections/${collectionId}/remove-file/`, { file_id: fileId });

//GET /collections/:id/files/
export const getCollectionFiles = (collectionId, page = 1) => api.get(`/collections/${collectionId}/files/`, { params: { page } });


//GET /collections/starred/
export const getStarredCollection = () => api.get(`/collections/starred/`);
