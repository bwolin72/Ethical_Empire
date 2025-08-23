// src/api/services/videoService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";

const BASE = "/api/videos/videos/";

const videoService = {
  // ================================
  // Public-facing (lists & filters)
  // ================================
  list: (params) => publicAxios.get(BASE, { params }),   // generic list with filters
  get: (id) => publicAxios.get(`${BASE}${id}/`),         // single video

  // Endpoint-based lists (from DRF custom actions)
  getHome: () => publicAxios.get(`${BASE}home/`),
  getAbout: () => publicAxios.get(`${BASE}about/`),
  getDecor: () => publicAxios.get(`${BASE}decor/`),
  getLiveBand: () => publicAxios.get(`${BASE}live_band/`),
  getCatering: () => publicAxios.get(`${BASE}catering/`),
  getMediaHosting: () => publicAxios.get(`${BASE}media_hosting/`),
  getVendor: () => publicAxios.get(`${BASE}vendor/`),
  getPartner: () => publicAxios.get(`${BASE}partner/`),
  getUser: () => publicAxios.get(`${BASE}user/`),
  getPartnerVendorDashboard: () =>
    publicAxios.get(`${BASE}partner_vendor_dashboard/`),

  // Generic helper so useFetcher can resolve by endpoint key
  byEndpoint: (key, params) => {
    const map = {
      home: videoService.getHome,
      about: videoService.getAbout,
      decor: videoService.getDecor,
      liveBand: videoService.getLiveBand,
      catering: videoService.getCatering,
      mediaHosting: videoService.getMediaHosting,
      vendor: videoService.getVendor,
      partner: videoService.getPartner,
      user: videoService.getUser,
      partnerVendorDashboard: videoService.getPartnerVendorDashboard,
    };
    const fn = map[key];
    if (!fn) {
      throw new Error(`[videoService] No endpoint method for key: ${key}`);
    }
    return fn(params);
  },

  // ================================
  // Admin (CRUD & mutations)
  // ================================
  create: (data) => axiosInstance.post(BASE, data),
  update: (id, data) => axiosInstance.put(`${BASE}${id}/`, data),
  patch: (id, data) => axiosInstance.patch(`${BASE}${id}/`, data),
  remove: (id) => axiosInstance.delete(`${BASE}${id}/`),

  // Toggle helpers (DRF custom @action)
  toggleActive: (id) => axiosInstance.post(`${BASE}${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${BASE}${id}/toggle_featured/`),
};

export default videoService;
