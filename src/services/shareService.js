import api from "../api/axios";

// POST /api/files/:id/share/
export const shareFile = (fileId, shareData) =>
  api.post(`/api/files/${fileId}/share/`, shareData);

// GET /api/files/shares/
export const getSharedFiles = (page = 1, pageSize = 10) =>
  api.get(`/api/files/shares/`, { params: { page, page_size: pageSize } });

// POST /api/files/:id/share/schedule/
export const scheduleShareFile = (fileId, shareData) =>
  api.post(`/api/files/${fileId}/share/schedule/`, shareData);

// GET /api/scheduled-mails/
export const getScheduledFiles = (page = 1, pageSize = 7, statusFilter = 'All') =>
  api.get(`/api/scheduled-mails/`, {
    params: {
      page,
      page_size: pageSize,
      ...(statusFilter !== 'All' && { status: statusFilter.toLowerCase() })
    }
  });

// GET /api/scheduled-mails/calendar/
export const getScheduledCalendar = (month, year) =>
  api.get("/api/scheduled-mails/calendar/", {
    params: { month, year }
  });

// POST /api/files/bulk-share/
export const bulkShareFiles = (shareData) =>
  api.post(`/api/files/bulk-share/`, shareData);

// PUT /api/files/:id/revoke/
export const revokeShare = (fileId) =>
  api.put(`/api/files/${fileId}/revoke/`);

// POST /api/scheduled-mails/:id/revoke/
export const revokeScheduledMail = (mailId) =>
  api.post(`/api/scheduled-mails/${mailId}/revoke/`);