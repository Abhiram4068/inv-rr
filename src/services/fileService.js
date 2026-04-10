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

// Chunked Upload Endpoints
export const checkChunkStatus = (uploadId) =>
  api.get(`/chunk/status/`, { params: { upload_id: uploadId } });

export const uploadChunk = (formData) =>
  api.post(`/chunk/upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const completeChunkUpload = (uploadId, originalName, contentType, description = "") =>
  api.post(`/chunk/complete/`, {
    upload_id: uploadId,
    original_name: originalName,
    content_type: contentType,
    description: description
  });

export const cancelChunkUpload = (uploadId) =>
  api.delete(`/chunk/cancel/`, { params: { upload_id: uploadId } });

// GET  /:id/file-download/
export const downloadFile = (fileId) =>
  api.get(`/${fileId}/file-download/`, { responseType: "blob" });

// DELETE /files/:id/file-delete/
export const deleteFile = (fileId) =>
  api.delete(`/files/${fileId}/file-delete/`);

// ARCHIVE /files/:id/archive/
export const archiveFile = (fileId) =>
  api.post(`/files/${fileId}/archive/`);

// GET  /files/view-recently-deleted/
export const getDeletedFiles = () =>
  api.get("/files/view-recently-deleted/");

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