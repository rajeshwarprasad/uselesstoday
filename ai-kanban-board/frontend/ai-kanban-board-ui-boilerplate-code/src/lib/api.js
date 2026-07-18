// ----------------------------------------------------------------------------
// API layer — BOILERPLATE (mock) build
//
// The whole UI runs on local mock data so you can build the frontend before the
// backend exists. Components never change — they only import authApi/boardApi/
// taskApi/columnApi/aiApi/userApi from here.
//
//   👉  WHEN THE BACKEND IS READY:
//        1. Uncomment the "REAL API" block below (it's the actual axios code).
//        2. Delete — or comment out — the "MOCK API" block at the bottom.
//        3. Remove the `./mockData` import.
//      That's the only file you touch to go live.
// ----------------------------------------------------------------------------

const TOKEN_KEY = "kanban_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/* ============================================================================
 * REAL API  —  uncomment this whole block once the backend is built
 * ==========================================================================*/

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors to a readable message; bounce to login on 401.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      const p = location.pathname;
      if (!p.startsWith("/login") && !p.startsWith("/invite")) location.assign("/login");
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.user),
  update: (data) => api.put("/auth/me", data).then((r) => r.data.user),
  forgotPassword: (data) => api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (data) => api.post("/auth/reset-password", data).then((r) => r.data),
  changePassword: (data) => api.post("/auth/change-password", data).then((r) => r.data),
  deleteAccount: (data) => api.delete("/auth/me", { data }).then((r) => r.data),
};

export const userApi = {
  search: (q) => api.get("/users/search", { params: { q } }).then((r) => r.data.users),
};

export const boardApi = {
  list: (companyId) => api.get("/boards", { params: { company_id: companyId } }).then((r) => r.data.boards),
  create: (data) => api.post("/boards", data).then((r) => r.data.board),
  get: (id) => api.get(`/boards/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/boards/${id}`, data).then((r) => r.data.board),
  remove: (id) => api.delete(`/boards/${id}`).then((r) => r.data),
  activity: (id, limit = 30) =>
    api.get(`/boards/${id}/activity`, { params: { limit } }).then((r) => r.data.activities),
  addMember: (id, data) => api.post(`/boards/${id}/members`, data).then((r) => r.data.member),
  removeMember: (id, userId) => api.delete(`/boards/${id}/members/${userId}`).then((r) => r.data),
  generateInvite: (id, data) => api.post(`/boards/${id}/invites`, data).then((r) => r.data.invite),
  listInvites: (id) => api.get(`/boards/${id}/invites`).then((r) => r.data.invites),
  deleteInvite: (id, inviteId) => api.delete(`/boards/${id}/invites/${inviteId}`).then((r) => r.data),
};

export const inviteApi = {
  get: (token) => api.get(`/invite/${token}`).then((r) => r.data.invite),
  accept: (token) => api.post(`/invite/${token}/accept`).then((r) => r.data),
};

export const columnApi = {
  create: (boardId, data) =>
    api.post(`/boards/${boardId}/columns`, data).then((r) => r.data.column),
  update: (boardId, columnId, data) =>
    api.patch(`/boards/${boardId}/columns/${columnId}`, data).then((r) => r.data.column),
  remove: (boardId, columnId) =>
    api.delete(`/boards/${boardId}/columns/${columnId}`).then((r) => r.data),
};

export const taskApi = {
  list: (boardId, params) =>
    api.get(`/boards/${boardId}/tasks`, { params }).then((r) => r.data.tasks),
  create: (boardId, data) =>
    api.post(`/boards/${boardId}/tasks`, data).then((r) => r.data.task),
  update: (boardId, taskId, data) =>
    api.patch(`/boards/${boardId}/tasks/${taskId}`, data).then((r) => r.data.task),
  move: (boardId, taskId, data) =>
    api.patch(`/boards/${boardId}/tasks/${taskId}/move`, data).then((r) => r.data.task),
  moveToBoard: (boardId, taskId, data) =>
    api.patch(`/boards/${boardId}/tasks/${taskId}/move-to-board`, data).then((r) => r.data.task),
  remove: (boardId, taskId) =>
    api.delete(`/boards/${boardId}/tasks/${taskId}`).then((r) => r.data),
};

export const aiApi = {
  generateTasks: (boardId, data) =>
    api.post(`/boards/${boardId}/ai/generate-tasks`, data).then((r) => r.data),
  breakdown: (boardId, data) =>
    api.post(`/boards/${boardId}/ai/breakdown`, data).then((r) => r.data.subtasks),
  summary: (boardId) => api.post(`/boards/${boardId}/ai/summary`).then((r) => r.data.summary),
};

export const companyApi = {
  list: () => api.get("/companies").then((r) => r.data.companies),
  create: (data) => api.post("/companies", data).then((r) => r.data),
  get: (id) => api.get(`/companies/${id}`).then((r) => r.data.company),
  update: (id, data) => api.put(`/companies/${id}`, data).then((r) => r.data.company),
  remove: (id) => api.delete(`/companies/${id}`).then((r) => r.data),
  members: (id) => api.get(`/companies/${id}/members`).then((r) => r.data),
  addMember: (id, data) => api.post(`/companies/${id}/members`, data).then((r) => r.data.member),
  removeMember: (id, userId) => api.delete(`/companies/${id}/members/${userId}`).then((r) => r.data),
  listInvites: (id) => api.get(`/companies/${id}/invites`).then((r) => r.data.invites),
  generateInvite: (id, data) => api.post(`/companies/${id}/invites`, data).then((r) => r.data.invite),
  deleteInvite: (id, inviteId) => api.delete(`/companies/${id}/invites/${inviteId}`).then((r) => r.data),
};

export const companyInviteApi = {
  get: (token) => api.get(`/company-invite/${token}`).then((r) => r.data.invite),
  accept: (token) => api.post(`/company-invite/${token}/accept`).then((r) => r.data),
};

export const notificationApi = {
  list: () => api.get("/notifications").then((r) => r.data.notifications),
  check: () => api.post("/notifications/check").then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};
