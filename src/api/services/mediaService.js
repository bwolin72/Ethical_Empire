// src/api/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../mediaAPI"; // <-- make sure this points to the right file

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.defaultList),         // GET /media/
  getBanners: () => publicAxios.get(API.banners),           // GET /media/banners/
  getFeatured: () => publicAxios.get(API.featured),         // GET /media/featured/

  // -------- Filtered endpoints --------
  getVendorMedia: () => publicAxios.get(API.vendor),                      // GET /media/vendor/
  getPartnerMedia: () => publicAxios.get(API.partner),                    // GET /media/partner/
  getUserMedia: () => publicAxios.get(API.user),                          // GET /media/user/
  getHomeMedia: () => publicAxios.get(API.home),                          // GET /media/home/
  getAboutMedia: () => publicAxios.get(API.about),                        // GET /media/about/
  getDecorMedia: () => publicAxios.get(API.decor),                        // GET /media/decor/
  getLiveBandMedia: () => publicAxios.get(API.liveBand),                  // GET /media/live-band/
  getCateringMedia: () => publicAxios.get(API.catering),                  // GET /media/catering/
  getMediaHosting: () => publicAxios.get(API.mediaHosting),               // GET /media/media-hosting/
  getPartnerVendorDashboardMedia: () => publicAxios.get(API.partnerVendorDashboard), // GET /media/partner-vendor-dashboard/

  // -------- Admin-only --------
  uploadMedia: (formData) => axiosInstance.post(API.upload, formData),         // POST /media/upload/
  getAllMedia: () => axiosInstance.get(API.all),                               // GET /media/all/
  updateMedia: (id, payload) => axiosInstance.patch(API.update(id), payload),  // PATCH /media/<id>/update/
  toggleActive: (id) => axiosInstance.post(API.toggle(id)),                    // POST /media/<id>/toggle/
  toggleFeatured: (id) => axiosInstance.post(API.toggleFeatured(id)),          // POST /media/<id>/toggle/featured/
  deleteMedia: (id) => axiosInstance.delete(API.delete(id)),                   // DELETE /media/<id>/delete/
  restoreMedia: (id) => axiosInstance.post(API.restore(id)),                   // POST /media/<id>/restore/
  getArchivedMedia: () => axiosInstance.get(API.archived),                     // GET /media/archived/
  reorderMedia: (payload) => axiosInstance.post(API.reorder, payload),         // POST /media/reorder/
  getMediaStats: () => axiosInstance.get(API.stats),                           // GET /media/stats/

  // -------- Debug --------
  debugProto: () => axiosInstance.get(API.debugProto),                         // GET /media/debug/proto/
};

export default mediaService;
