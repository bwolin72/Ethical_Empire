// api/videosAPI.js
import axiosInstance from "./axiosInstance";

const videosAPI = {
  // Standard CRUD
  list: (params = {}) => axiosInstance.get("/videos/", { params }),
  retrieve: (id) => axiosInstance.get(`/videos/${id}/`),
  create: (payload) => axiosInstance.post("/videos/", payload),
  update: (id, payload) => axiosInstance.patch(`/videos/${id}/`, payload),
  delete: (id) => axiosInstance.delete(`/videos/${id}/`),

  // Toggles
  toggleActive: (id) => axiosInstance.post(`/videos/${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`/videos/${id}/toggle_featured/`),

  // Endpoint-specific fetches
  home: () => axiosInstance.get("/videos/home/"),
  about: () => axiosInstance.get("/videos/about/"),
  decor: () => axiosInstance.get("/videos/decor/"),
  liveBand: () => axiosInstance.get("/videos/live_band/"),
  catering: () => axiosInstance.get("/videos/catering/"),
  mediaHosting: () => axiosInstance.get("/videos/media_hosting/"),
  user: () => axiosInstance.get("/videos/user/`"),
  vendor: () => axiosInstance.get("/videos/vendor/"),
  partner: () => axiosInstance.get("/videos/partner/"),
  partnerDashboard: () => axiosInstance.get("/videos/partner_dashboard/"),
  agencyDashboard: () => axiosInstance.get("/videos/agency_dashboard/"),
};

export default videosAPI;
