import api from "../api/axios";

// GET /api/file-list/
export const getFiles = (page = 1, search = "") =>
  api.get("/api/file-list/", { params: { page, search } });

// GET /api/files/:id/
export const getFileById = (fileId) =>
  api.get(`/api/files/${fileId}/`);

// PATCH /api/files/:id/update/
export const updateFile = (fileId, data) =>
  api.patch(`/api/files/${fileId}/update/`, data);

// POST /api/files/
export const uploadFile = (formData) =>
  api.post("/api/files/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// POST /api/files/upload/chunk/
export const uploadFileChunk = (formData) =>
  api.post("/api/files/upload/chunk/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET /api/files/upload/chunk/status/?upload_id=
export const getChunkUploadStatus = (uploadId) =>
  api.get("/api/files/upload/chunk/status/", { params: { upload_id: uploadId } });

// POST /api/files/upload/chunk/control/
export const controlChunkUpload = (uploadId, action) =>
  api.post("/api/files/upload/chunk/control/", { upload_id: uploadId, action });

// GET /api/:id/file-download/
export const downloadFile = (fileId) =>
  api.get(`/api/${fileId}/file-download/`, { responseType: "blob" });

// DELETE /api/files/:id/delete/
export const deleteFile = (fileId) =>
  api.delete(`/api/files/${fileId}/delete/`);

// POST /api/files/bulk-delete/
export const bulkDeleteFiles = (fileIds) =>
  api.post("/api/files/bulk-delete/", { file_ids: fileIds });

// POST /api/files/bulk-archive/
export const bulkArchiveFiles = (fileIds) =>
  api.post("/api/files/bulk-archive/", { file_ids: fileIds });

// POST /api/files/:id/archive/
export const archiveFile = (fileId) =>
  api.post(`/api/files/${fileId}/archive/`);

// GET /api/files/archives/
export const getArchives = (page = 1, search = "") =>
  api.get("/api/files/archives/", { params: { page, search } });

// POST /api/files/:id/unarchive/
export const unarchiveFile = (fileId) =>
  api.post(`/api/files/${fileId}/unarchive/`);

// POST /api/files/bulk-unarchive/
export const bulkUnarchiveFiles = (fileIds) =>
  api.post("/api/files/bulk-unarchive/", { file_ids: fileIds });

// PUT /api/files/archives/delete/
export const deleteArchivedFiles = (fileIds) =>
  api.put("/api/files/archives/delete/", { file_ids: fileIds });

// GET /api/files/view-recently-deleted/
export const getDeletedFiles = (page = 1, search = "") =>
  api.get("/api/files/view-recently-deleted/", { params: { page, search } });

// DELETE /api/files/clear-trash/:id/
export const clearTrashFile = (fileId) =>
  api.delete(`/api/files/clear-trash/${fileId}/`);

// POST /api/files/:id/restore/recently-deleted/
export const restoreFile = (fileId) =>
  api.post(`/api/files/${fileId}/restore/recently-deleted/`);

// POST /api/files/bulk-restore-trash/
export const bulkRestoreFiles = (fileIds) =>
  api.post("/api/files/bulk-restore-trash/", { file_ids: fileIds });

// DELETE /api/files/empty-trash/
export const emptyTrash = () =>
  api.delete("/api/files/empty-trash/");

// POST /api/files/:id/share/
export const shareFile = (fileId, shareData) =>
  api.post(`/api/files/${fileId}/share/`, shareData);

// GET /api/files/public/:token/
export const getPublicFile = (token) =>
  api.get(`/api/files/public/${token}/`);

// GET /api/files/starred/
export const getStarredFiles = () =>
  api.get("/api/files/starred/");

// GET /api/files/recents/
export const getRecentFiles = () =>
  api.get("/api/files/recents/");

export const getFileViewUrl = (fileId) => {
  const baseURL = import.meta.env.VITE_API_URL || "";
  return `${baseURL}/api/${fileId}/file-view-inline/`;
};

export const getFileDownloadUrl = (fileId) => {
  const baseURL = import.meta.env.VITE_API_URL || "";
  return `${baseURL}/api/${fileId}/file-download/`;
};