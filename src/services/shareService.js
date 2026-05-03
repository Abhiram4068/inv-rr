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

export const getScheduledFiles = (page = 1, pageSize = 7, statusFilter = 'All') =>
  api.get(`/scheduled-mails/`, { 
    params: { 
      page, 
      page_size: pageSize,
      ...(statusFilter !== 'All' && { status: statusFilter.toLowerCase() })
    } 
  }); 

export const getScheduledCalendar = (month, year) => {
  return api.get("/scheduled-mails/calendar/", {
    params: { month, year }
  });
};

//PUT /files/revoke/
export const revokeShare = (fileId) =>
  api.put(`/files/${fileId}/revoke/`);

//POST /scheduled-mails/:id/revoke/
export const revokeScheduledMail = (mailId) =>
  api.post(`/scheduled-mails/${mailId}/revoke/`);
