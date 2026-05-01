import api from "../api/axios";

export const getReports = (
  page = 1,
  page_size = 12,
  download = false,
  timeline = null,
  search = ''
) => {
  const params = { page, page_size, download };
  if (timeline) params.timeline = timeline;
  if (search) params.search = search;

  return api.get("/report-downloads/", {
    params,
    responseType: download ? "blob" : "json", // ✅ THIS LINE FIXES CSV
  });
};