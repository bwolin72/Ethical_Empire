// src/api/services/reviewService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import reviewsAPI from "../reviewsAPI";

export const reviewService = {
  // Public endpoints (no auth)
  list: (params) => publicAxios.get(reviewsAPI.listCreate(), params ? { params } : undefined),

  // Admin/authenticated endpoints
  create: (payload) => axiosInstance.post(reviewsAPI.listCreate(), payload),
  approve: (id) => axiosInstance.patch(reviewsAPI.approve(id)),
  delete: (id) => axiosInstance.delete(reviewsAPI.delete(id)),
  reply: (id, payload) => axiosInstance.post(reviewsAPI.reply(id), payload),
  adminList: () => axiosInstance.get(reviewsAPI.adminList()),
};

export default reviewService;
