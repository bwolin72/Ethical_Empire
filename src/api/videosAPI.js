// api/videosAPI.js
import axiosInstance from "./axiosInstance";

const videosAPI = {
  // Standard CRUD
  list: (params = {}) => axiosInstance.get("/videos/videos/", { params }),
  retrieve: (id) => axiosInstance.get(`/videos/videos/videos/${id}/`),
  create: (payload) => axiosInstance.post("/videos/videos/", payload),
  update: (id, payload) => axiosInstance.patch(`/videos/videos/${id}/`, payload),
  delete: (id) => axiosInstance.delete(`/videos/videos/${id}/`),

  // Toggles
  toggleActive: (id) => axiosInstance.post(`/videos/videos/${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`/videos/videos/${id}/toggle_featured/`),

  // Endpoint-specific fetches
  home: () => axiosInstance.get("/videos/videos/home/"),
  about: () => axiosInstance.get("/videos/videos/about/"),
  decor: () => axiosInstance.get("/videos/videos/decor/"),
  liveBand: () => axiosInstance.get("/videos/videos/live_band/"),
  catering: () => axiosInstance.get("/videos/videos/catering/"),
  mediaHosting: () => axiosInstance.get("/videos/videos/media_hosting/"),
  user: () => axiosInstance.get("/videos/videos/user/`"),
  vendor: () => axiosInstance.get("/videos/videos/vendor/"),
  partner: () => axiosInstance.get("/videos/videos/partner/"),
  partnerDashboard: () => axiosInstance.get("/videos/videos/partner_dashboard/"),
  agencyDashboard: () => axiosInstance.get("/videos/videos/agency_dashboard/"),
};

export default videosAPI;
