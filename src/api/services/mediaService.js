// src/api/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.media.defaultList),       // GET /api/media/
  getBanners: () => publicAxios.get(API.media.banners),         // GET /api/media/banners/
  getFeatured: () => publicAxios.get(API.media.featured),       // GET /api/media/featured/

  // -------- Filtered endpoints --------
  getVendorMedia: () => publicAxios.get(API.media.vendor),                // GET /api/media/vendor/
  getPartnerMedia: () => publicAxios.get(API.media.partner),              // GET /api/media/partner/
  getUserMedia: () => publicAxios.get(API.media.user),                    // GET /api/media/user/
  getHomeMedia: () => publicAxios.get(API.media.home),                    // GET /api/media/home/
  getAboutMedia: () => publicAxios.get(API.media.about),                  // GET /api/media/about/
  getDecorMedia: () => publicAxios.get(API.media.decor),                  // GET /api/media/decor/
  getLiveBandMedia: () => publicAxios.get(API.media.liveBand),            // GET /api/media/live-band/
  getCateringMedia: () => publicAxios.get(API.media.catering),            // GET /api/media/catering/
  getMediaHosting: () => publicAxios.get(API.media.mediaHosting),         // GET /api/media/media-hosting/
  getPartnerVendorDashboardMedia: () => 
    publicAxios.get(API.media.partnerVendorDashboard),                    // GET /api/media/partner-vendor-dashboard/

  // -------- Admin-only --------
  uploadMedia: (formData) => axiosInstance.post(API.media.upload, formData),   // POST /api/media/upload/
  getAllMedia: () => axiosInstance.get(API.media.all),                         // GET /api/media/all/
  updateMedia: (id, payload) => axiosInstance.patch(`${API.media.update}${id}/`, payload), 
  toggleActive: (id) => axiosInstance.post(`${API.media.toggle}${id}/toggle/`), 
  toggleFeatured: (id) => axiosInstance.post(`${API.media.toggleFeatured}${id}/toggle/featured/`),
  deleteMedia: (id) => axiosInstance.delete(`${API.media.delete}${id}/delete/`),
  restoreMedia: (id) => axiosInstance.post(`${API.media.restore}${id}/restore/`),
  getArchivedMedia: () => axiosInstance.get(API.media.archived),
  reorderMedia: (payload) => axiosInstance.post(API.media.reorder, payload),
  getMediaStats: () => axiosInstance.get(API.media.stats),

  // -------- Debug --------
  debugProto: () => axiosInstance.get(API.media.debugProto),
};

export default mediaService;
