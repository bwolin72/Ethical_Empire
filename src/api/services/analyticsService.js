import axiosInstance from '../axiosInstance';
import API from '../api';

const analyticsService = {
  getOverview: () => axiosInstance.get(API.analytics.overview),
  getMediaStats: () => axiosInstance.get(API.analytics.mediaStats),
  getBookingStats: () => axiosInstance.get(API.analytics.bookingStats),
  getUserStats: () => axiosInstance.get(API.analytics.userStats),
};

export default analyticsService;
