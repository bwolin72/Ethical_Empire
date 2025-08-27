import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import reviewsAPI from '../reviewsAPI';

const reviewService = {
  getReviews: () => publicAxios.get(reviewsAPI.list),
  createReview: (data) => axiosInstance.post(reviewsAPI.create, data),
  getAdminReviews: () => axiosInstance.get(reviewsAPI.adminList),
  approveReview: (id) => axiosInstance.post(reviewsAPI.approve(id)),
  replyToReview: (id, reply) => axiosInstance.post(reviewsAPI.reply(id), { reply }),
  deleteReview: (id) => axiosInstance.delete(reviewsAPI.delete(id)),
};

export default reviewService;
