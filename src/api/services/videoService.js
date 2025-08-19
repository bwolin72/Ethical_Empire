// src/api/videoService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../api';

const videoService = {
  // ---- Core CRUD ----
  list: () => publicAxios.get(`${API.videos.base}/`),
  detail: (id) => publicAxios.get(`${API.videos.base}/${id}/`),
  create: (data) => axiosInstance.post(`${API.videos.base}/`, data),
  update: (id, data) => axiosInstance.patch(`${API.videos.base}/${id}/`, data),
  delete: (id) => axiosInstance.delete(`${API.videos.base}/${id}/`),

  // ---- Toggles ----
  toggleActive: (id) =>
    axiosInstance.post(`${API.videos.base}/${id}/toggle_active/`),
  toggleFeatured: (id) =>
    axiosInstance.post(`${API.videos.base}/${id}/toggle_featured/`),

  // ---- Endpoint-specific fetches ----
  home: () => publicAxios.get(`${API.videos.base}/home/`),
  about: () => publicAxios.get(`${API.videos.base}/about/`),
  decor: () => publicAxios.get(`${API.videos.base}/decor/`),
  liveBand: () => publicAxios.get(`${API.videos.base}/live_band/`),
  catering: () => publicAxios.get(`${API.videos.base}/catering/`),
  mediaHosting: () => publicAxios.get(`${API.videos.base}/media_hosting/`),
  vendor: () => publicAxios.get(`${API.videos.base}/vendor/`),
  partner: () => publicAxios.get(`${API.videos.base}/partner/`),
  user: () => publicAxios.get(`${API.videos.base}/user/`),
};

export default videoService;
