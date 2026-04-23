import api from "../api/axios";

// POST /files/:id/share/
export const shareFile = (fileId, shareData) =>
  api.post(`/files/${fileId}/share/`, shareData);

// GET /files/scheduled/
export const getSharedFiles = (page=1, pageSize=10) =>
  api.get(`/files/shares/`, { params: { page, page_size: pageSize } });

// POST /files/:id/share/schedule/
export const scheduleShareFile = (fileId, shareData) =>
  api.post(`/files/${fileId}/share/schedule/`, shareData);


// GET /files/scheduled/
export const getScheduledFiles = () =>
  api.get(`/scheduled-mails/`);

//PUT /files/revoke/
export const revokeShare = (fileId) =>
  api.put(`/files/${fileId}/revoke/`);



