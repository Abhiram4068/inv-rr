  import api from "../api/axios";

// GET  /file-list/
export const getFiles = (page = 1, search = "") =>
  api.get("/file-list/", { params: { page, search } });

// GET /files/:id/
export const getFileById = (fileId) =>
  api.get(`/files/${fileId}/`);


// PATCH /files/:id/update/
export const updateFile=(fileId, data) =>
  api.patch(`files/${fileId}/update/`, data);


// POST /file-upload
export const uploadFile = (formData) =>
  api.post("/files/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET  /:id/file-download/
export const downloadFile = (fileId) =>
  api.get(`/${fileId}/file-download/`, { responseType: "blob" });

// DELETE /files/:id/file-delete/
export const deleteFile = (fileId) =>
  api.delete(`/files/${fileId}/delete/`);

// ARCHIVE /files/:id/archive/
export const archiveFile = (fileId) =>
  api.post(`/files/${fileId}/archive/`);

// GET /files/archives/
export const getArchives = (page = 1, search = "") =>
  api.get("/files/archives/", { params: { page, search } });

// UNARCHIVE /files/:id/unarchive/
export const unarchiveFile = (fileId) =>
  api.post(`/files/${fileId}/unarchive/`);

// PUT /files/archive-delete/
export const deleteArchivedFiles = (fileIds) =>
  api.put("/files/archives/delete/", {
    file_ids: fileIds,
  });

// GET  /files/view-recently-deleted/
export const getDeletedFiles = (page = 1, search = "") =>
  api.get("/files/view-recently-deleted/", { params: { page, search } });

// DELETE /files/clear-trash/:id/
export const clearTrashFile = (fileId) =>
  api.delete(`/files/clear-trash/${fileId}/`);

// POST /files/:id/restore/recently-deleted/
export const restoreFile = (fileId) =>
  api.post(`/files/${fileId}/restore/recently-deleted/`);

// POST /files/:id/share/
export const shareFile = (fileId, shareData) =>
  api.post(`/files/${fileId}/share/`, shareData);

// GET  /files/public/:token/   ← this one is PUBLIC, no cookie needed
export const getPublicFile = (token) =>
  api.get(`/files/public/${token}/`);


//GET /files/starred/
export const getStarredFiles = () => api.get(`/files/starred/`);

//GET files/recents/
export const getRecentFiles = () => api.get(`/files/recents/`);

