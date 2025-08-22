// src/api/videoService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";
import endpointMap from "./endpointMap";

const base = `${API.videos.base}/videos`;

const videoService = {
  list: () => publicAxios.get(`${base}/`),
  detail: (id) => publicAxios.get(`${base}/${id}/`),
  create: (data) => axiosInstance.post(`${base}/`, data),
  update: (id, data) => axiosInstance.patch(`${base}/${id}/`, data),
  delete: (id) => axiosInstance.delete(`${base}/${id}/`),

  toggleActive: (id) => axiosInstance.post(`${base}/${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${base}/${id}/toggle_featured/`),

  // 🔑 Shared dynamic fetch
  byEndpoint: (key) => {
    const path = endpointMap[key];
    if (!path) throw new Error(`[videoService] Unknown endpoint: ${key}`);
    return publicAxios.get(`${base}/${path}`);
  },

  // Legacy explicit calls (optional)
  home: () => videoService.byEndpoint("home"),
  about: () => videoService.byEndpoint("about"),
  decor: () => videoService.byEndpoint("decor"),
  liveBand: () => videoService.byEndpoint("liveBand"),
  catering: () => videoService.byEndpoint("catering"),
  mediaHosting: () => videoService.byEndpoint("mediaHosting"),
  vendor: () => videoService.byEndpoint("vendor"),
  partner: () => videoService.byEndpoint("partner"),
  user: () => videoService.byEndpoint("user"),

  getVideos: (params) => publicAxios.get(`${base}/`, { params }),
};

export default videoService;
