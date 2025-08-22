// src/api/mediaAPI.js
import baseURL from './baseURL';
import axiosInstance from './axiosInstance';
import publicAxios from './publicAxios';

const mediaAPI = {
  endpoints: {
    // ===== MEDIA (public-facing) =====
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
    partnerVendorDashboard: `${baseURL}/media/partner-vendor-dashboard/`, // new endpoint

    // ===== ADMIN (media management) =====
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
  },

  // ===== PUBLIC METHODS (MEDIA) =====
  getDefaultList: () => publicAxios.get(mediaAPI.endpoints.defaultList),
  getBanners: () => publicAxios.get(mediaAPI.endpoints.banners),
  getFeatured: () => publicAxios.get(mediaAPI.endpoints.featured),
  getVendor: () => publicAxios.get(mediaAPI.endpoints.vendor),
  getPartner: () => publicAxios.get(mediaAPI.endpoints.partner),
  getUser: () => publicAxios.get(mediaAPI.endpoints.user),
  getHome: () => publicAxios.get(mediaAPI.endpoints.home),
  getAbout: () => publicAxios.get(mediaAPI.endpoints.about),
  getDecor: () => publicAxios.get(mediaAPI.endpoints.decor),
  getLiveBand: () => publicAxios.get(mediaAPI.endpoints.liveBand),
  getCatering: () => publicAxios.get(mediaAPI.endpoints.catering),
  getMediaHosting: () => publicAxios.get(mediaAPI.endpoints.mediaHosting),
  getPartnerVendorDashboard: () => publicAxios.get(mediaAPI.endpoints.partnerVendorDashboard),

  // ===== ADMIN METHODS (MEDIA) =====
  upload: (data) => axiosInstance.post(mediaAPI.endpoints.upload, data),
  getAll: () => axiosInstance.get(mediaAPI.endpoints.all),
  update: (id, data) => axiosInstance.patch(mediaAPI.endpoints.update(id), data),
  toggle: (id) => axiosInstance.post(mediaAPI.endpoints.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(mediaAPI.endpoints.toggleFeatured(id)),
  delete: (id) => axiosInstance.delete(mediaAPI.endpoints.delete(id)),
  restore: (id) => axiosInstance.post(mediaAPI.endpoints.restore(id)),
  getArchived: () => axiosInstance.get(mediaAPI.endpoints.archived),
  reorder: (data) => axiosInstance.post(mediaAPI.endpoints.reorder, data),
  getStats: () => axiosInstance.get(mediaAPI.endpoints.stats),
  debugProto: () => axiosInstance.get(mediaAPI.endpoints.debugProto),
};

export default mediaAPI;
