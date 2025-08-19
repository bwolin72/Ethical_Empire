import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const reviewService = {
  getReviews: () => publicAxios.get(API.reviews.list),
  getReviewDetail: (id) => publicAxios.get(API.reviews.detail(id)),
  createReview: (data) => publicAxios.post(API.reviews.create, data),
  updateReview: (id, data) => axiosInstance.patch(API.reviews.update(id), data),
  deleteReview: (id) => axiosInstance.delete(API.reviews.delete(id)),
  approveReview: (id) => axiosInstance.post(API.reviews.approve(id)),
};

export default reviewService;
