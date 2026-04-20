import api from "../api/axios";

// POST /files/:id/share/
export const shareFile = (fileId, shareData) =>
  api.post(`/files/${fileId}/share/`, shareData);

// POST /files/:id/share/schedule/
export const scheduleShareFile = (fileId, shareData) =>
  api.post(`/files/${fileId}/share/schedule/`, shareData);
