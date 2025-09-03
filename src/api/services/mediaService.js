import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../mediaAPI'; // should expose: defaultList, all, upload, update(id), delete(id), restore(id), toggle(id), toggleFeatured(id), archived, reorder, stats, and many section lists

const mediaService = {
  // Public lists
  getMedia: () => publicAxios.get(API.defaultList),            // GET /api/media/
  getBanners: () => publicAxios.get(API.banners),
  getFeatured: () => publicAxios.get(API.featured),
  getVendorMedia: () => publicAxios.get(API.vendor),
  getPartnerMedia: () => publicAxios.get(API.partner),
  getUserMedia: () => publicAxios.get(API.user),
  getHomeMedia: () => publicAxios.get(API.home),
  getAboutMedia: () => publicAxios.get(API.about),
  getDecorMedia: () => publicAxios.get(API.decor),
  getLiveBandMedia: () => publicAxios.get(API.liveBand),
  getCateringMedia: () => publicAxios.get(API.catering),
  getMediaHosting: () => publicAxios.get(API.mediaHosting),
  getPartnerVendorDashboardMedia: () => publicAxios.get(API.partnerVendorDashboard),

  // Admin
  uploadMedia: (formData) => axiosInstance.post(API.upload, formData),
  getAllMedia: () => axiosInstance.get(API.all),
  updateMedia: (id, payload) => axiosInstance.patch(API.update(id), payload),
  toggleActive: (id) => axiosInstance.post(API.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(API.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.restore(id)),
  getArchivedMedia: () => axiosInstance.get(API.archived),
  reorderMedia: (payload) => axiosInstance.post(API.reorder, payload),
  getMediaStats: () => axiosInstance.get(API.stats),           // GET /api/media/stats/

  // Debug
  debugProto: () => axiosInstance.get(API.debugProto),

  // 🔁 Dashboard compatibility aliases
  list: () => publicAxios.get(API.defaultList),
  stats: () => axiosInstance.get(API.stats),
};

export default mediaService;
