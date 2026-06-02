import api from "../api/axios";

export const getCollections = (
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
  page = 1,
  pageSize = null
) =>
  api.get("/api/collections/", {
    params: {
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      ...(pageSize ? { page_size: pageSize } : {}),
    },
  });

// GET /api/collections/:id/
export const getCollectionById = (collectionId) =>
  api.get(`/api/collections/${collectionId}/`);

// POST /api/collections/
export const createCollection = (collectionData) =>
  api.post("/api/collections/", collectionData);

// PATCH /api/collections/:id/
export const updateCollection = (collectionId, collectionData) =>
  api.patch(`/api/collections/${collectionId}/`, collectionData);

// DELETE /api/collections/:id/
export const deleteCollection = (collectionId) =>
  api.delete(`/api/collections/${collectionId}/`);

// POST /api/collections/:id/files/:file_id/
export const addFileToCollection = (collectionId, fileId) =>
  api.post(`/api/collections/${collectionId}/files/${fileId}/`);

// DELETE /api/collections/:id/files/:file_id/
export const removeFileFromCollection = (collectionId, fileId) =>
  api.delete(`/api/collections/${collectionId}/files/${fileId}/`);

// GET /api/collections/:id/files/
export const getCollectionFiles = (collectionId, page = 1, search = "") =>
  api.get(`/api/collections/${collectionId}/files/`, { params: { page, search } });

// GET /api/collections/starred/
export const getStarredCollection = () =>
  api.get("/api/collections/starred/");