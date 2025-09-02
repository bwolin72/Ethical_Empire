// src/api/services/newsletterService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import newsletterAPI from "../newsletterAPI";

const newsletterService = {
  // === Public-facing ===
  subscribe: (data) => publicAxios.post(newsletterAPI.subscribe, data),
  confirm: (params) => publicAxios.get(newsletterAPI.confirm, { params }),
  unsubscribe: (data) => publicAxios.post(newsletterAPI.unsubscribe, data),
  resubscribe: (data) => publicAxios.post(newsletterAPI.resubscribe, data),
  resendConfirmation: (data) =>
    publicAxios.post(newsletterAPI.resendConfirmation, data),

  // === Admin Only ===
  getSubscribers: () => axiosInstance.get(newsletterAPI.list),
  getSubscriberCount: () => axiosInstance.get(newsletterAPI.count),
  getLogs: () => axiosInstance.get(newsletterAPI.logs),
  sendNewsletter: (data) => axiosInstance.post(newsletterAPI.send, data),
  deleteSubscriber: (id) => axiosInstance.delete(newsletterAPI.delete(id)),
};

export default newsletterService;
