import api from "../api/axios";

// GET /api/storage/summary/
export const getStorageSummary = () => api.get("/api/storage/summary/");

// GET /api/storage/manage/
export const getStorageFiles = (params) =>
  api.get("/api/storage/manage/", { params });

// POST /api/storage/permanent-delete/
export const permanentDeleteFiles = (file_ids) =>
  api.post("/api/storage/permanent-delete/", { file_ids });