// src/api/apiService.js
import baseURL from "./baseURL";

// ----- Centralised endpoint definitions -----
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

// ----- Default export for backward compatibility -----
const apiService = {
  API_ENDPOINTS,
};

export default apiService;
