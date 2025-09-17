// src/api/apiService.js
import baseURL from "./baseURL";

// ---- Grouped endpoints (organized for devs) ----
export const API_ENDPOINTS = {
  media: {
    all: `${baseURL}/media/all/`,
    about: `${baseURL}/media/about/`,
    banners: `${baseURL}/media/banners/`,
    home: `${baseURL}/media/home/`,
    featured: `${baseURL}/media/featured/`,
    user: `${baseURL}/media/user/`,
    vendor: `${baseURL}/media/vendor/`,
  },

  videos: {
    all: `${baseURL}/videos/videos/`,
    toggleActive: (id) => `${baseURL}/videos/videos/${id}/toggle_active/`,
    toggleFeatured: (id) => `${baseURL}/videos/videos/${id}/toggle_featured/`,
  },

  services: {
    all: `${baseURL}/services/`,
    detail: (slug) => `${baseURL}/services/${slug}/`,
  },

  reviews: {
    all: `${baseURL}/reviews/`,
    admin: `${baseURL}/reviews/admin/`,
    approve: (id) => `${baseURL}/reviews/${id}/approve/`,
    delete: (id) => `${baseURL}/reviews/${id}/delete/`,
    reply: (id) => `${baseURL}/reviews/${id}/reply/`,
  },

  promotions: {
    all: `${baseURL}/promotions/`,
    active: `${baseURL}/promotions/active/`,
    detail: (id) => `${baseURL}/promotions/${id}/`,
  },
};

// ---- Flat aliases for useFetcher ----
export const FLAT_ENDPOINTS = {
  media: API_ENDPOINTS.media.all,
  banners: API_ENDPOINTS.media.banners,
  about: API_ENDPOINTS.media.about,
  videos: API_ENDPOINTS.videos.all,
  services: API_ENDPOINTS.services.all,
  reviews: API_ENDPOINTS.reviews.all,
  promotions: API_ENDPOINTS.promotions.all,
};

// ---- Default export for backwards compatibility ----
const apiService = { API_ENDPOINTS, FLAT_ENDPOINTS };
export default apiService;
