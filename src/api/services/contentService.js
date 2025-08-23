// src/api/services/contentService.js
import publicAxios from '../publicAxios';
import videoService from './videoService';
import mediaAPI from '../mediaAPI';

const contentService = {
  // -------- Videos --------
  getVideos: (params) => videoService.list(params), // uses /api/videos/videos/

  // -------- Promotions --------
  getPromotions: () => publicAxios.get('/api/promotions/'), // adjust if /active/ is needed

  // -------- Reviews --------
  getReviews: () => publicAxios.get('/api/reviews/'),

  // -------- Media (public-facing) --------
  getBanners: () => publicAxios.get(mediaAPI.endpoints.banners), // /api/media/banners/
  getMedia: () => publicAxios.get(mediaAPI.endpoints.defaultList), // /api/media/

  // (Admin-only should go via mediaService, not here)
};

export default contentService;
