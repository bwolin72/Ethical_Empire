// src/api/services/mediaService.js
import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
import API from '../mediaAPI'; 
// API should expose: defaultList, all, upload, update(id), delete(id), restore(id), toggle(id), toggleFeatured(id),
// archived, reorder, stats, banners, featured, and all section-specific lists.

const mediaService = {
  // -------- Public-facing lists --------
  getMedia: () => publicAxios.get(API.defaultList),         // GET /api/media/
  getBanners: () => publicAxios.get(API.banners),           // GET /api/media/banners/
  getFeatured: () => publicAxios.get(API.featured),         // GET /api/media/featured/

  // Section-specific (public)
  getVendorMedia: () => publicAxios.get(API.vendor),        // /api/media/vendor/
  getPartnerMedia: () => publicAxios.get(API.partner),      // /api/media/partner/
  getUserMedia: () => publicAxios.get(API.user),            // /api/media/user/
  getHomeMedia: () => publicAxios.get(API.home),            // /api/media/home/
  getAboutMedia: () => publicAxios.get(API.about),          // /api/media/about/
  getDecorMedia: () => publicAxios.get(API.decor),          // /api/media/decor/
  getLiveBandMedia: () => publicAxios.get(API.liveBand),    // /api/media/live-band/
  getCateringMedia: () => publicAxios.get(API.catering),    // /api/media/catering/
  getMediaHosting: () => publicAxios.get(API.mediaHosting), // /api/media/media-hosting/
  getPartnerVendorDashboardMedia: () =>
    publicAxios.get(API.partnerVendorDashboard),            // /api/media/partner-vendor-dashboard/

  // -------- Admin-only --------
  uploadMedia: (formData) => axiosInstance.post(API.upload, formData), // POST /api/media/upload/
  getAllMedia: () => axiosInstance.get(API.all),                       // GET /api/media/all/
  updateMedia: (id, payload) => axiosInstance.patch(API.update(id), payload),
  toggleActive: (id) => axiosInstance.post(API.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(API.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.restore(id)),
  getArchivedMedia: () => axiosInstance.get(API.archived),
  reorderMedia: (payload) => axiosInstance.post(API.reorder, payload),
  getMediaStats: () => axiosInstance.get(API.stats), // GET /api/media/stats/

  // -------- Debug --------
  debugProto: () => axiosInstance.get(API.debugProto), // /api/media/debug/proto/

  // -------- Compatibility Aliases (for dashboard / MediaManagement.jsx) --------
  getFeaturedMedia: () => publicAxios.get(API.featured), // alias for old calls
  byEndpoint: (endpoint) => {
    const map = {
      home: API.home,
      about: API.about,
      decor: API.decor,
      liveBand: API.liveBand,
      catering: API.catering,
      mediaHosting: API.mediaHosting,
      vendor: API.vendor,
      partner: API.partner,
      user: API.user,
      partnerVendorDashboard: API.partnerVendorDashboard,
    };
    return publicAxios.get(map[endpoint] || API.defaultList);
  },

  // 🔁 Legacy dashboard shorthands
  list: () => publicAxios.get(API.defaultList),
  stats: () => axiosInstance.get(API.stats),
};

export default mediaService;
