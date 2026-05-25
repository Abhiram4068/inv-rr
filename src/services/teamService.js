import api from "../api/axios";

// GET /teams/?search=
export const getTeams = (search = "") =>
  api.get("/teams/", { params: { search } });

// GET /teams/:id/
export const getTeamById = (teamId) =>
  api.get(`/teams/${teamId}/`);

// POST /teams/
export const createTeam = (data) =>
  api.post("/teams/", data);

// PATCH /teams/:id/
export const updateTeam = (teamId, data) =>
  api.patch(`/teams/${teamId}/`, data);

// DELETE /teams/:id/
export const deleteTeam = (teamId) =>
  api.delete(`/teams/${teamId}/`);


// GET /teams/:teamId/members/
export const getTeamMembers = (teamId) =>
  api.get(`/teams/${teamId}/members/`);

// POST /teams/:teamId/members/
export const addTeamMember = (teamId, email) =>
  api.post(`/teams/${teamId}/members/`, { email: email });

// DELETE /teams/:teamId/members/:userId/
export const removeTeamMember = (teamId, memberId) =>
  api.delete(`/teams/${teamId}/members/${memberId}/`);