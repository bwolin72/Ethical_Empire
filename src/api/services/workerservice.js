import workerApi from "../workerapi";

// --- Services ---
export const WorkersService = {
  // Profiles
  getMe: async () => {
    const { data } = await workerApi.get("workers/me/");
    return data;
  },
  updateMe: async (payload) => {
    const me = await WorkersService.getMe();
    const { data } = await workerApi.patch(`workers/${me.id}/`, payload);
    return data;
  },

  // Service categories
  listServices: async () => {
    const { data } = await workerApi.get("services/");
    return data;
  },

  // Tasks
  listTasks: async (params = {}) => {
    const { data } = await workerApi.get("tasks/", { params });
    return data;
  },
  getTask: async (id) => {
    const { data } = await workerApi.get(`tasks/${id}/`);
    return data;
  },
  startTask: async (id) => {
    const { data } = await workerApi.post(`tasks/${id}/start/`);
    return data;
  },
  pauseTask: async (id) => {
    const { data } = await workerApi.post(`tasks/${id}/pause/`);
    return data;
  },
  resumeTask: async (id) => {
    const { data } = await workerApi.post(`tasks/${id}/resume/`);
    return data;
  },
  completeTask: async (id) => {
    const { data } = await workerApi.post(`tasks/${id}/complete/`);
    return data;
  },
  setTaskProgress: async (id, progress) => {
    const { data } = await workerApi.post(`tasks/${id}/progress/`, { progress });
    return data;
  },
  addTaskComment: async ({ task, note }) => {
    const { data } = await workerApi.post("task-comments/", { task, note });
    return data;
  },

  // Notifications
  listNotifications: async (params = {}) => {
    const { data } = await workerApi.get("notifications/", { params });
    return data;
  },
  markAllRead: async () => {
    const { data } = await workerApi.post("notifications/mark-all-read/");
    return data;
  },
  markRead: async (id) => {
    const { data } = await workerApi.post(`notifications/${id}/read/`);
    return data;
  },

  // Calendar & Stats
  getCalendar: async () => {
    const { data } = await workerApi.get("calendar/");
    return data;
  },
  getStats: async () => {
    const { data } = await workerApi.get("stats/");
    return data;
  },
};

