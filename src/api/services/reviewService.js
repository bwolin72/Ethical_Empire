import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import reviewsAPI from '../reviewsAPI'; // should expose: list, create, adminList, approve(id), reply(id), delete(id)

const reviewService = {
  // Public
  getReviews: () => publicAxios.get(reviewsAPI.list),         // GET /api/reviews/
  createReview: (data) => publicAxios.post(reviewsAPI.create, data),

  // Admin
  getAdminReviews: () => axiosInstance.get(reviewsAPI.adminList), // GET /api/reviews/admin/
  approveReview: (id) => axiosInstance.post(reviewsAPI.approve(id)),
  replyToReview: (id, reply) => axiosInstance.post(reviewsAPI.reply(id), { reply }),
  deleteReview: (id) => axiosInstance.delete(reviewsAPI.delete(id)),

  // 🔁 Dashboard compatibility alias
  list: () => publicAxios.get(reviewsAPI.list),
};

export default reviewService;
