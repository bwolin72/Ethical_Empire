// src/api/mediaAPI.js
import baseURL from './baseURL';
import axiosInstance from './axiosInstance';
import publicAxios from './publicAxios';

// ===== ENDPOINTS =====
const endpoints = {
  // --- Public-facing ---
  defaultList: `${baseURL}/media/`,
  banners: `${baseURL}/media/banners/`,
  featured: `${baseURL}/media/featured/`,
  vendor: `${baseURL}/media/vendor/`,
  partner: `${baseURL}/media/partner/`,
  user: `${baseURL}/media/user/`,
  home: `${baseURL}/media/home/`,
  about: `${baseURL}/media/about/`,
  decor: `${baseURL}/media/decor/`,
  liveBand: `${baseURL}/media/live-band/`,
  catering: `${baseURL}/media/catering/`,
  mediaHosting: `${baseURL}/media/media-hosting/`,
  partnerVendorDashboard: `${baseURL}/media/partner-vendor-dashboard/`,

  // --- Admin-facing ---
  upload: `${baseURL}/media/upload/`,
  all: `${baseURL}/media/all/`,
  update: (id) => `${baseURL}/media/${id}/update/`,
  toggle: (id) => `${baseURL}/media/${id}/toggle/`,
  toggleFeatured: (id) => `${baseURL}/media/${id}/toggle/featured/`,
  delete: (id) => `${baseURL}/media/${id}/delete/`,
  restore: (id) => `${baseURL}/media/${id}/restore/`,
  archived: `${baseURL}/media/archived/`,
  reorder: `${baseURL}/media/reorder/`,
  stats: `${baseURL}/media/stats/`,
  debugProto: `${baseURL}/media/debug/proto/`,
};

// ===== AUTO-GENERATE PUBLIC GETTERS =====
const publicGetters = Object.fromEntries(
  Object.entries(endpoints)
    .filter(([key]) =>
      [
        'defaultList',
        'banners',
        'featured',
        'vendor',
        'partner',
        'user',
        'home',
        'about',
        'decor',
        'liveBand',
        'catering',
        'mediaHosting',
        'partnerVendorDashboard',
      ].includes(key)
    )
    .map(([key, url]) => [`get${key[0].toUpperCase() + key.slice(1)}`, () => publicAxios.get(url)])
);

// ===== API OBJECT =====
const mediaAPI = {
  endpoints,

  // Public GET methods (auto-generated)
  ...publicGetters,

  // Admin methods
  upload: (data) => axiosInstance.post(endpoints.upload, data),
  getAll: () => axiosInstance.get(endpoints.all),
  update: (id, data) => axiosInstance.patch(endpoints.update(id), data),
  toggle: (id) => axiosInstance.post(endpoints.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(endpoints.toggleFeatured(id)),
  delete: (id) => axiosInstance.delete(endpoints.delete(id)),
  restore: (id) => axiosInstance.post(endpoints.restore(id)),
  getArchived: () => axiosInstance.get(endpoints.archived),
  reorder: (data) => axiosInstance.post(endpoints.reorder, data),
  getStats: () => axiosInstance.get(endpoints.stats),
  debugProto: () => axiosInstance.get(endpoints.debugProto),
};

export default mediaAPI;
