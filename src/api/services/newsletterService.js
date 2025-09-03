import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import newsletterAPI from '../newsletterAPI'; // should expose: subscribe, confirm, unsubscribe, resubscribe, resendConfirmation, list, count, logs, send, delete(id)

const newsletterService = {
  // Public-facing
  subscribe: (data) => publicAxios.post(newsletterAPI.subscribe, data),
  confirm: (params) => publicAxios.get(newsletterAPI.confirm, { params }),
  unsubscribe: (data) => publicAxios.post(newsletterAPI.unsubscribe, data),
  resubscribe: (data) => publicAxios.post(newsletterAPI.resubscribe, data),
  resendConfirmation: (data) => publicAxios.post(newsletterAPI.resendConfirmation, data),

  // Admin
  getSubscribers: () => axiosInstance.get(newsletterAPI.list),    // /api/newsletter/list/
  getSubscriberCount: () => axiosInstance.get(newsletterAPI.count), // /api/newsletter/count/
  getLogs: () => axiosInstance.get(newsletterAPI.logs),           // /api/newsletter/logs/
  sendNewsletter: (data) => axiosInstance.post(newsletterAPI.send, data),
  deleteSubscriber: (id) => axiosInstance.delete(newsletterAPI.delete(id)),

  // 🔁 Dashboard compatibility aliases
  logs: () => axiosInstance.get(newsletterAPI.logs),
  count: () => axiosInstance.get(newsletterAPI.count),
};

export default newsletterService;
