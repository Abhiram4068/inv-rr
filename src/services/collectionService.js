import api from "../api/axios";

//GET /collections/
export const getCollections = () => api.get("/collections/");

//GET /collections/:id/
export const getCollectionById = (collectionId) => api.get(`/collections/${collectionId}/`);

//POST /collections/
export const createCollection = (collectionData) => api.post("/collections/", collectionData);

//PATCH /collections/:id/
export const updateCollection = (collectionId, collectionData) => api.patch(`/collections/${collectionId}/`, collectionData);

//DELETE /collections/:id/
export const deleteCollection = (collectionId) => api.delete(`/collections/${collectionId}/`);

//POST /collections/:id/add-file/
export const addFileToCollection = (collectionId, fileId) => api.post(`/collections/${collectionId}/add-file/`, { file_id: fileId });

//POST /collections/:id/remove-file/
export const removeFileFromCollection = (collectionId, fileId) => api.post(`/collections/${collectionId}/remove-file/`, { file_id: fileId });

//GET /collections/:id/files/
export const getCollectionFiles = (collectionId) => api.get(`/collections/${collectionId}/files/`);


//GET /collections/starred/
export const getStarredCollection = () => api.get(`/collections/starred/`);