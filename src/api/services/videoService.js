// src/api/videoService.js
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import videosAPI from "../api/videosAPI";

const videoService = {
  // -------- Public-facing --------
  getVideos: (params = {}) => publicAxios.get(videosAPI.defaultList, { params }),
  getHomeVideos: () => publicAxios.get(videosAPI.home),
  getAboutVideos: () => publicAxios.get(videosAPI.about),
  getDecorVideos: () => publicAxios.get(videosAPI.decor),
  getLiveBandVideos: () => publicAxios.get(videosAPI.liveBand),
  getCateringVideos: () => publicAxios.get(videosAPI.catering),
  getMediaHostingVideos: () => publicAxios.get(videosAPI.mediaHosting),
  getVendorVideos: () => publicAxios.get(videosAPI.vendor),
  getPartnerVideos: () => publicAxios.get(videosAPI.partner),
  getUserVideos: () => publicAxios.get(videosAPI.user),
  getPartnerVendorDashboardVideos: () => publicAxios.get(videosAPI.partnerVendorDashboard),

  // -------- Admin & management --------
  uploadVideo: (data) => axiosInstance.post(videosAPI.upload, data),
  updateVideo: (id, data) => axiosInstance.patch(`${videosAPI.update}${id}/`, data),
  deleteVideo: (id) => axiosInstance.delete(`${videosAPI.delete}${id}/`),

  toggleActive: (id) => axiosInstance.post(`${videosAPI.toggle}${id}/toggle_active/`),
  toggleFeatured: (id) => axiosInstance.post(`${videosAPI.toggleFeatured}${id}/toggle_featured/`),
};

export default videoService;
