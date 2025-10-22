// src/api/videosAPI.js
import axiosInstance from "./axiosInstance";

const BASE = "/videos/videos/";

const videosAPI = {
  // CRUD
  list: (params = {}) => axiosInstance.get(BASE, { params }),
  retrieve: (id) => axiosInstance.get(`${BASE}${id}/`),
  create: (payload) => axiosInstance.post(BASE, payload),
  update: (id, payload) => axiosInstance.patch(`${BASE}${id}/`, payload),
  delete: (id) => axiosInstance.delete(`${BASE}${id}/`),

  // Toggles
  toggleActive: (id) => axiosInstance.post(`${BASE}${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${BASE}${id}/toggle_featured/`),

  // Public content routes
  home: () => axiosInstance.get(`${BASE}home/`),
  about: () => axiosInstance.get(`${BASE}about/`),
  decor: () => axiosInstance.get(`${BASE}decor/`),
  liveBand: () => axiosInstance.get(`${BASE}live_band/`),
  catering: () => axiosInstance.get(`${BASE}catering/`),
  mediaHosting: () => axiosInstance.get(`${BASE}media_hosting/`),
  user: () => axiosInstance.get(`${BASE}user/`),
  vendor: () => axiosInstance.get(`${BASE}vendor/`),
  partner: () => axiosInstance.get(`${BASE}partner/`),
  partnerDashboard: () => axiosInstance.get(`${BASE}partner_dashboard/`),
  agencyDashboard: () => axiosInstance.get(`${BASE}agency_dashboard/`),
};

export default videosAPI;
