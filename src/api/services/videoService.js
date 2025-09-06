import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import videosAPI from '../videosAPI'; // should expose: list, upload, update(id), delete(id), toggle(id), toggleFeatured(id), plus sections

const videoService = {
  // Public
  getVideos: (params = {}) => publicAxios.get(videosAPI.list, { params }), // GET /api/videos/videos/
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

  // Admin
  uploadVideo: (data) => axiosInstance.post(videosAPI.upload, data),
  updateVideo: (id, data) => axiosInstance.patch(videosAPI.update(id), data),
  deleteVideo: (id) => axiosInstance.delete(videosAPI.delete(id)),
  toggleActive: (id) => axiosInstance.post(videosAPI.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(videosAPI.toggleFeatured(id)),

  // 🔁 Dashboard compatibility alias
  list: (params = {}) => publicAxios.get(videosAPI.list, { params }),
};

export default videoService;
