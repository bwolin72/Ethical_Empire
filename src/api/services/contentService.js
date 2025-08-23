// src/api/services/contentService.js
import axiosInstance from '../axiosInstance';

const contentService = {
  // Videos
  getVideos: () => axiosInstance.get('/api/videos/videos/'),

  // Promotions
  getPromotions: () => axiosInstance.get('/api/promotions/'),

  // Reviews
  getReviews: () => axiosInstance.get('/api/reviews/'),

  // Media - Banners
  getBanners: () => axiosInstance.get('/api/media/banners/'),

  // Media - All (general media library)
  getMedia: () => axiosInstance.get('/api/media/all/'),
};

export default contentService;
