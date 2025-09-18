// src/api/apiService.js
import axiosInstance from './axiosInstance';
import baseURL from './baseURL';

/**
 * API_ENDPOINTS
 * -------------
 * Flat map of "dotted" keys so that calls like
 *   useFetcher('videos.all')
 * work exactly as before.
 * Each value returns an axios promise.
 */
export const API_ENDPOINTS = {
  // ---- Media ----
  'media.all':      (params = {}) => axiosInstance.get(`${baseURL}/media/all/`,      { params }),
  'media.about':    (params = {}) => axiosInstance.get(`${baseURL}/media/about/`,    { params }),
  'media.banners':  (params = {}) => axiosInstance.get(`${baseURL}/media/banners/`,  { params }),
  'media.home':     (params = {}) => axiosInstance.get(`${baseURL}/media/home/`,     { params }),
  'media.featured': (params = {}) => axiosInstance.get(`${baseURL}/media/featured/`, { params }),
  'media.user':     (params = {}) => axiosInstance.get(`${baseURL}/media/user/`,     { params }),
  'media.vendor':   (params = {}) => axiosInstance.get(`${baseURL}/media/vendor/`,   { params }),

  // ---- Videos ----
  'videos.all':            (params = {}) => axiosInstance.get(`${baseURL}/videos/videos/`, { params }),
  'videos.toggleActive':   (id) => axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_active/`),
  'videos.toggleFeatured': (id) => axiosInstance.post(`${baseURL}/videos/videos/${id}/toggle_featured/`),

  // ---- Services ----
  'services.all':    (params = {}) => axiosInstance.get(`${baseURL}/services/`, { params }),
  'services.detail': (slug, params = {}) =>
                      axiosInstance.get(`${baseURL}/services/${slug}/`, { params }),

  // ---- Reviews ----
  'reviews.all':     (params = {}) => axiosInstance.get(`${baseURL}/reviews/`,       { params }),
  'reviews.admin':   (params = {}) => axiosInstance.get(`${baseURL}/reviews/admin/`, { params }),
  'reviews.approve': (id) => axiosInstance.post(`${baseURL}/reviews/${id}/approve/`),
  'reviews.delete':  (id) => axiosInstance.delete(`${baseURL}/reviews/${id}/delete/`),
  'reviews.reply':   (id, payload) =>
                     axiosInstance.post(`${baseURL}/reviews/${id}/reply/`, payload),

  // ---- Promotions ----
  'promotions.all':    (params = {}) => axiosInstance.get(`${baseURL}/promotions/`,        { params }),
  'promotions.active': (params = {}) => axiosInstance.get(`${baseURL}/promotions/active/`, { params }),
  'promotions.detail': (id, params = {}) =>
                       axiosInstance.get(`${baseURL}/promotions/${id}/`, { params }),
};

/**
 * Backward-compatibility alias.
 * Anything that imported { FLAT_ENDPOINTS }
 * can continue to work with the same dotted keys.
 */
export const FLAT_ENDPOINTS = API_ENDPOINTS;

const apiService = { API_ENDPOINTS, FLAT_ENDPOINTS };
export default apiService;
