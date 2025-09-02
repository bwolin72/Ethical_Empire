// src/api/reviewService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import reviewsAPI from '../reviewsAPI';

const reviewService = {
  // Public
  getReviews: () => publicAxios.get(reviewsAPI.list),
  createReview: (data) => publicAxios.post(reviewsAPI.create, data),

  // Admin
  getAdminReviews: () => axiosInstance.get(reviewsAPI.adminList),
  approveReview: (id) => axiosInstance.post(reviewsAPI.approve(id)),
  replyToReview: (id, reply) => axiosInstance.post(reviewsAPI.reply(id), { reply }),
  deleteReview: (id) => axiosInstance.delete(reviewsAPI.delete(id)),
};

export default reviewService;
