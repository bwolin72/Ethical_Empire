import axiosInstance from "./axiosInstance";
import { handleRequest } from "./axiosCommon";

const base = {
  workers: "workers/",
  tasks: "tasks/",
  comments: "task-comments/",
  notifications: "notifications/",
  calendar: "calendar/",
  stats: "stats/",
};

// Workers
export const workersAPI = {
  list: (params = {}) => handleRequest(axiosInstance.get(base.workers, { params })),
  retrieve: (id) => handleRequest(axiosInstance.get(`${base.workers}${id}/`)),
  me: () => handleRequest(axiosInstance.get(`${base.workers}me/`)),
  create: (payload) => handleRequest(axiosInstance.post(base.workers, payload)),
  update: (id, payload) => handleRequest(axiosInstance.put(`${base.workers}${id}/`, payload)),
  partialUpdate: (id, payload) => handleRequest(axiosInstance.patch(`${base.workers}${id}/`, payload)),
  delete: (id) => handleRequest(axiosInstance.delete(`${base.workers}${id}/`)),
};

// Tasks
export const tasksAPI = {
  list: (params = {}) => handleRequest(axiosInstance.get(base.tasks, { params })),
  retrieve: (id) => handleRequest(axiosInstance.get(`${base.tasks}${id}/`)),
  create: (payload) => handleRequest(axiosInstance.post(base.tasks, payload)),
  update: (id, payload) => handleRequest(axiosInstance.put(`${base.tasks}${id}/`, payload)),
  partialUpdate: (id, payload) => handleRequest(axiosInstance.patch(`${base.tasks}${id}/`, payload)),
  delete: (id) => handleRequest(axiosInstance.delete(`${base.tasks}${id}/`)),

  start: (id) => handleRequest(axiosInstance.post(`${base.tasks}${id}/start/`)),
  pause: (id) => handleRequest(axiosInstance.post(`${base.tasks}${id}/pause/`)),
  resume: (id) => handleRequest(axiosInstance.post(`${base.tasks}${id}/resume/`)),
  complete: (id) => handleRequest(axiosInstance.post(`${base.tasks}${id}/complete/`)),
  setProgress: (id, progress) =>
    handleRequest(axiosInstance.post(`${base.tasks}${id}/progress/`, { progress })),
};

// Comments
export const commentsAPI = {
  list: (params = {}) => handleRequest(axiosInstance.get(base.comments, { params })),
  retrieve: (id) => handleRequest(axiosInstance.get(`${base.comments}${id}/`)),
  create: (payload) => handleRequest(axiosInstance.post(base.comments, payload)),
  update: (id, payload) => handleRequest(axiosInstance.put(`${base.comments}${id}/`, payload)),
  delete: (id) => handleRequest(axiosInstance.delete(`${base.comments}${id}/`)),
};

// Notifications
export const notificationsAPI = {
  list: (params = {}) => handleRequest(axiosInstance.get(base.notifications, { params })),
  retrieve: (id) => handleRequest(axiosInstance.get(`${base.notifications}${id}/`)),
  markAllRead: () => handleRequest(axiosInstance.post(`${base.notifications}mark-all-read/`)),
  markRead: (id) => handleRequest(axiosInstance.post(`${base.notifications}${id}/read/`)),
};

// Calendar & Stats
export const miscAPI = {
  calendar: (params = {}) => handleRequest(axiosInstance.get(base.calendar, { params })),
  stats: (params = {}) => handleRequest(axiosInstance.get(base.stats, { params })),
};

export default {
  workersAPI,
  tasksAPI,
  commentsAPI,
  notificationsAPI,
  miscAPI,
};
