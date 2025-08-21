// src/api/videoService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const base = `${API.videos.base}/videos`;

const videoService = {
  // ---- Core CRUD ----
  list: () => publicAxios.get(`${base}/`),
  detail: (id) => publicAxios.get(`${base}/${id}/`),
  create: (data) => axiosInstance.post(`${base}/`, data),
  update: (id, data) => axiosInstance.patch(`${base}/${id}/`, data),
  delete: (id) => axiosInstance.delete(`${base}/${id}/`),

  // ---- Toggles ----
  toggleActive: (id) => axiosInstance.post(`${base}/${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${base}/${id}/toggle_featured/`),

  // ---- Endpoint-specific ----
  home: () => publicAxios.get(`${base}/home/`),
  about: () => publicAxios.get(`${base}/about/`),
  decor: () => publicAxios.get(`${base}/decor/`),
  liveBand: () => publicAxios.get(`${base}/live_band/`),
  catering: () => publicAxios.get(`${base}/catering/`),
  mediaHosting: () => publicAxios.get(`${base}/media_hosting/`),
  vendor: () => publicAxios.get(`${base}/vendor/`),
  partner: () => publicAxios.get(`${base}/partner/`),
  user: () => publicAxios.get(`${base}/user/`),

  // ---- Alias for compatibility ----
  getVideos: () => publicAxios.get(`${base}/`),
};

export default videoService;
