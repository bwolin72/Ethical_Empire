// src/api/services/reviewService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import reviewsAPI from '../reviewsAPI';

const reviewService = {
  // ----- Public -----
  getReviews: () => publicAxios.get(reviewsAPI.list),    // GET approved reviews
  getAll: () => publicAxios.get(reviewsAPI.list),        // Alias for compatibility
  list: () => publicAxios.get(reviewsAPI.list),          // Another alias

  // NOTE: POST requires authentication (backend enforces IsAuthenticated)
  createReview: (data) => axiosInstance.post(reviewsAPI.create, data),

  // ----- Admin -----
  getAdminReviews: () => axiosInstance.get(reviewsAPI.adminList),   // GET all (admin)
  approveReview: (id) => axiosInstance.post(reviewsAPI.approve(id)),// POST approve
  replyToReview: (id, reply) =>
    axiosInstance.post(reviewsAPI.reply(id), { reply }),            // POST reply
  deleteReview: (id) => axiosInstance.delete(reviewsAPI.delete(id)),// DELETE review
};

export default reviewService;
