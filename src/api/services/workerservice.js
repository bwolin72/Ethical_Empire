// workerservice.js
// High-level service functions wrapping workersAPI for UI components.
// Normalizes backend payloads to convenient frontend shapes.

import {
  workersAPI,
  tasksAPI,
  commentsAPI,
  notificationsAPI,
  miscAPI,
} from "../workerAPI";

/* ----------------- Normalizers ----------------- */

const normalizeWorker = (w) => ({
  id: w.id,
  user: w.user,
  fullName: w.user_full_name || null,
  email: w.email || null,
  category: w.category || null,
  categoryId: w.category_id || (w.category && w.category.id) || null,
  phone: w.phone || "",
  gender: w.gender || "",
  dateOfBirth: w.date_of_birth || null,
  avatar: w.avatar || null,
  bio: w.bio || "",
  rating: w.rating ?? 0,
  availabilityStatus: w.availability_status || null,
  createdAt: w.created_at || null,
  updatedAt: w.updated_at || null,
});

const normalizeTask = (t) => ({
  id: t.id,
  title: t.title,
  description: t.description,
  service: t.service || null,
  serviceId: t.service && t.service.id ? t.service.id : t.service_id || null,
  bookingId: t.booking || t.booking_id || null,
  assignedTo: t.assigned_to || null,
  assignedToName: t.assigned_to_name || null,
  assignedBy: t.assigned_by || null,
  assignedAt: t.assigned_at || null,
  dueAt: t.due_at || null,
  status: t.status,
  progress: t.progress,
  startedAt: t.started_at || null,
  completedAt: t.completed_at || null,
  timeSpentSeconds: t.time_spent_seconds || 0,
  lastTimerStart: t.last_timer_start || null,
  priority: t.priority || 0,
  comments: t.comments || [],
  timeLogs: t.time_logs || [],
  canStartNow: !!t.can_start_now,
  createdAt: t.created_at || null,
  updatedAt: t.updated_at || null,
});

const normalizeComment = (c) => ({
  id: c.id,
  task: c.task,
  author: c.author,
  authorName: c.author_name || null,
  note: c.note,
  createdAt: c.created_at || null,
});

const normalizeNotification = (n) => ({
  id: n.id,
  worker: n.worker,
  title: n.title,
  message: n.message,
  type: n.ntype,
  relatedTask: n.related_task || null,
  relatedBooking: n.related_booking || null,
  isRead: n.is_read,
  createdAt: n.created_at || null,
});

const normalizeCalendarItem = (c) => ({
  id: c.id,
  title: c.title,
  status: c.status,
  start: c.start,
  end: c.end,
  eventId: c.event_id || null,
  service: c.service || null,
});

/* ----------------- Worker Service ----------------- */

export const workerService = {
  // Workers
  async listWorkers(params = {}) {
    const data = await workersAPI.list(params);
    return Array.isArray(data) ? data.map(normalizeWorker) : [];
  },

  async getWorker(id) {
    const data = await workersAPI.retrieve(id);
    return normalizeWorker(data);
  },

  async getMyProfile() {
    const data = await workersAPI.me();
    return normalizeWorker(data);
  },

  async createWorker(payload) {
    const data = await workersAPI.create(payload);
    return normalizeWorker(data);
  },

  async updateWorker(id, payload) {
    const data = await workersAPI.update(id, payload);
    return normalizeWorker(data);
  },

  async partialUpdateWorker(id, payload) {
    const data = await workersAPI.partialUpdate(id, payload);
    return normalizeWorker(data);
  },

  async deleteWorker(id) {
    await workersAPI.delete(id);
    return true;
  },

  // Tasks
  async listTasks(params = {}) {
    const data = await tasksAPI.list(params);
    return Array.isArray(data) ? data.map(normalizeTask) : [];
  },

  async getTask(id) {
    const data = await tasksAPI.retrieve(id);
    return normalizeTask(data);
  },

  async createTask(payload) {
    const data = await tasksAPI.create(payload);
    return normalizeTask(data);
  },

  async updateTask(id, payload) {
    const data = await tasksAPI.update(id, payload);
    return normalizeTask(data);
  },

  async partialUpdateTask(id, payload) {
    const data = await tasksAPI.partialUpdate(id, payload);
    return normalizeTask(data);
  },

  async deleteTask(id) {
    await tasksAPI.delete(id);
    return true;
  },

  // Task actions
  async startTask(id) {
    const data = await tasksAPI.start(id);
    return normalizeTask(data);
  },

  async pauseTask(id) {
    const data = await tasksAPI.pause(id);
    return normalizeTask(data);
  },

  async resumeTask(id) {
    const data = await tasksAPI.resume(id);
    return normalizeTask(data);
  },

  async completeTask(id) {
    const data = await tasksAPI.complete(id);
    return normalizeTask(data);
  },

  async setTaskProgress(id, progress) {
    // validate locally as well
    const p = Number(progress);
    if (!Number.isInteger(p) || p < 0 || p > 100) {
      throw new Error("Progress must be an integer between 0 and 100.");
    }
    const data = await tasksAPI.setProgress(id, p);
    return normalizeTask(data);
  },

  // Comments
  async listComments(params = {}) {
    const data = await commentsAPI.list(params);
    return Array.isArray(data) ? data.map(normalizeComment) : [];
  },

  async createComment(payload) {
    const data = await commentsAPI.create(payload);
    return normalizeComment(data);
  },

  async updateComment(id, payload) {
    const data = await commentsAPI.update(id, payload);
    return normalizeComment(data);
  },

  async deleteComment(id) {
    await commentsAPI.delete(id);
    return true;
  },

  // Notifications
  async listNotifications(params = {}) {
    const data = await notificationsAPI.list(params);
    return Array.isArray(data) ? data.map(normalizeNotification) : [];
  },

  async getNotification(id) {
    const data = await notificationsAPI.retrieve(id);
    return normalizeNotification(data);
  },

  async markAllNotificationsRead() {
    await notificationsAPI.markAllRead();
    return true;
  },

  async markNotificationRead(id) {
    await notificationsAPI.markRead(id);
    return true;
  },

  // Calendar & Stats
  async getCalendar(params = {}) {
    const data = await miscAPI.calendar(params);
    return Array.isArray(data) ? data.map(normalizeCalendarItem) : [];
  },

  async getStats(params = {}) {
    const data = await miscAPI.stats(params);
    // data shape from backend: { total, assigned, in_progress, completed, time_spent_seconds }
    return {
      total: data.total ?? 0,
      assigned: data.assigned ?? 0,
      inProgress: data.in_progress ?? 0,
      completed: data.completed ?? 0,
      timeSpentSeconds: data.time_spent_seconds ?? 0,
    };
  },
};

export default workerService;
