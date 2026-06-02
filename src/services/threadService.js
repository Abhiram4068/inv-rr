import api from "../api/axios";

/** Prefer backend `detail` / `message` on success responses. */
export const getApiSuccessMessage = (data, fallback = "Success") => {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  return fallback;
};

/** Extract a user-facing message from an axios error. */
export const getApiErrorMessage = (error, fallback = "API error") => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail.length) return String(data.detail[0]);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? String(val[0]) : String(val);
  }
  return fallback;
};

// ─── Threads ─────────────────────────────────────────────────────────────────

export const getThreads = () =>
  api.get("/api/threads/").then((res) => res.data);

export const createThread = (body) =>
  api.post("/api/threads/", body).then((res) => res.data);

export const updateThread = (id, body) =>
  api.put(`/api/threads/${id}/`, body).then((res) => res.data);

export const deleteThread = (id) =>
  api.delete(`/api/threads/${id}/`).then((res) => res.data ?? null);

// ─── Graph ───────────────────────────────────────────────────────────────────

export const getThreadGraph = (threadId) =>
  api.get(`/api/threads/${threadId}/graph/`).then((res) => res.data);

// ─── Nodes ───────────────────────────────────────────────────────────────────

export const createNode = (threadId, body) =>
  api.post(`/api/threads/${threadId}/nodes/`, body).then((res) => res.data);

export const updateNode = (nodeId, body) =>
  api.put(`/api/nodes/${nodeId}/`, body).then((res) => res.data);

export const deleteNode = (nodeId) =>
  api.delete(`/api/nodes/${nodeId}/`).then((res) => res.data ?? null);

export const updateNodePosition = (nodeId, body) =>
  api.patch(`/api/nodes/${nodeId}/position/`, body).then((res) => res.data);

// ─── Stages ──────────────────────────────────────────────────────────────────

export const getStages = (threadId) =>
  api.get(`/api/threads/${threadId}/stages/`).then((res) => res.data);

export const createStage = (threadId, name) =>
  api.post(`/api/threads/${threadId}/stages/`, { name }).then((res) => res.data);

export const updateStage = (stageId, name) =>
  api.put(`/api/stages/${stageId}/`, { name }).then((res) => res.data);

export const deleteStage = (stageId) =>
  api.delete(`/api/stages/${stageId}/`).then((res) => res.data ?? null);

// ─── Dependencies ────────────────────────────────────────────────────────────

export const addDependency = (sourceNodeId, targetNodeId, dependencyType = "DEPENDS_ON") =>
  api
    .post(`/api/nodes/${sourceNodeId}/dependencies/`, {
      source_node: sourceNodeId,
      target_node: targetNodeId,
      dependency_type: dependencyType,
    })
    .then((res) => res.data);

export const removeDependency = (dependencyId) =>
  api.delete(`/api/dependencies/${dependencyId}/`).then((res) => res.data ?? null);

export const updateDependency = (dependencyId, dependencyType) =>
  api
    .patch(`/api/dependencies/${dependencyId}/`, { dependency_type: dependencyType })
    .then((res) => res.data);

// ─── Node files & activity ───────────────────────────────────────────────────

export const getNodeFiles = (nodeId) =>
  api.get(`/api/nodes/${nodeId}/files/`).then((res) => res.data);

export const uploadNodeFile = (nodeId, formData) =>
  api.post(`/api/nodes/${nodeId}/files/`, formData).then((res) => res.data);

export const deleteNodeFile = (fileId) =>
  api.delete(`/api/files/${fileId}/`).then((res) => res.data ?? null);

export const getNodeActivity = (nodeId) =>
  api.get(`/api/nodes/${nodeId}/activity/`).then((res) => res.data);