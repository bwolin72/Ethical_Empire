// src/api/services/videoService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";
import endpointMap from "./endpointMap";

const base = `${API.videos.base}/videos`;

const videoService = {
  // ===== List & Detail =====
  list: (params) => publicAxios.get(`${base}/`, params ? { params } : undefined),
  detail: (id, params) => publicAxios.get(`${base}/${id}/`, params ? { params } : undefined),

  // ===== CRUD =====
  create: (data) => axiosInstance.post(`${base}/`, data),
  update: (id, data) => axiosInstance.patch(`${base}/${id}/`, data),
  delete: (id) => axiosInstance.delete(`${base}/${id}/`),

  // ===== Toggle Flags =====
  toggleActive: (id) => axiosInstance.post(`${base}/${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${base}/${id}/toggle_featured/`),

  // ===== Dynamic Endpoint Fetch =====
  byEndpoint: (key, params) => {
    const path = endpointMap[key];
    if (!path) throw new Error(`[videoService] Unknown endpoint: ${key}`);
    return publicAxios.get(`${base}/${path}`, params ? { params } : undefined);
  },

  // ===== Legacy Explicit Calls =====
  home: (params) => videoService.byEndpoint("home", params),
  about: (params) => videoService.byEndpoint("about", params),
  decor: (params) => videoService.byEndpoint("decor", params),
  liveBand: (params) => videoService.byEndpoint("liveBand", params),
  catering: (params) => videoService.byEndpoint("catering", params),
  mediaHosting: (params) => videoService.byEndpoint("mediaHosting", params),
  vendor: (params) => videoService.byEndpoint("vendor", params),
  partner: (params) => videoService.byEndpoint("partner", params),
  user: (params) => videoService.byEndpoint("user", params),

  // ===== Alias for GET videos =====
  getVideos: (params) => videoService.list(params),
};

export default videoService;
