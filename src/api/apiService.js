// src/api/apiService.js
import axiosInstance from './axiosInstance';
import baseURL from './baseURL';

/**
 * Each API group below exposes functions that
 * directly return axios promises.
 * This is compatible with useFetcher’s
 * apiGroup[endpointKey](params) call pattern.
 */
export const API_ENDPOINTS = {
  media: {
    all: (params = {}) => axiosInstance.get(`${baseURL}/media/all/`, { params }),
    about: (params = {}) => axiosInstance.get(`${baseURL}/media/about/`, { params }),
    banners: (params = {}) => axiosInstance.get(`${baseURL}/media/banners/`, { params }),
    home: (params = {}) => axiosInstance.get(`${baseURL}/media/home/`, { params }),
    featured: (params = {}) => axiosInstance.get(`${baseURL}/media/featured/`, { params }),
    user: (params = {}) => axiosInstance.get(`${baseURL}/media/user/`, { params }),
    vendor: (params = {}) => axiosInstance.get(`${baseURL}/media/vendor/`, { params }),
  },

  videos: {
    all: (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/`, { params }),
    toggleActive: (id) =>
      axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_active/`),
    toggleFeatured: (id) =>
      axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_featured/`),
  },

  services: {
    all: (params = {}) => axiosInstance.get(`${baseURL}/services/`, { params }),
    detail: (slug, params = {}) =>
      axiosInstance.get(`${baseURL}/services/${slug}/`, { params }),
  },

  reviews: {
    all: (params = {}) => axiosInstance.get(`${baseURL}/reviews/`, { params }),
    admin: (params = {}) => axiosInstance.get(`${baseURL}/reviews/admin/`, { params }),
    approve: (id) =>
      axiosInstance.post(`${baseURL}/reviews/${id}/approve/`),
    delete: (id) =>
      axiosInstance.delete(`${baseURL}/reviews/${id}/delete/`),
    reply: (id, payload) =>
      axiosInstance.post(`${baseURL}/reviews/${id}/reply/`, payload),
  },

  promotions: {
    all: (params = {}) => axiosInstance.get(`${baseURL}/promotions/`, { params }),
    active: (params = {}) => axiosInstance.get(`${baseURL}/promotions/active/`, { params }),
    detail: (id, params = {}) =>
      axiosInstance.get(`${baseURL}/promotions/${id}/`, { params }),
  },
};

/**
 * Optional: simple aliases if you need quick direct imports
 * (still return axios promises)
 */
export const FLAT_ENDPOINTS = {
  media: API_ENDPOINTS.media.all,
  banners: API_ENDPOINTS.media.banners,
  about: API_ENDPOINTS.media.about,
  videos: API_ENDPOINTS.videos.all,
  services: API_ENDPOINTS.services.all,
  reviews: API_ENDPOINTS.reviews.all,
  promotions: API_ENDPOINTS.promotions.all,
};

const apiService = { API_ENDPOINTS, FLAT_ENDPOINTS };
export default apiService;
