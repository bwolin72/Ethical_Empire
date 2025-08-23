// src/api/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";
import endpointMap from "./endpointMap";

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.media.defaultList),   // /media/
  getBanners: () => publicAxios.get(API.media.banners),     // /media/banners/
  getFeaturedMedia: () => publicAxios.get(API.media.featured), // /media/featured/

  // -------- Admin & management --------
  // NOTE: No /media/all/ in backend — replaced with /media/ (same as getMedia)
  getAllMedia: () => publicAxios.get(API.media.defaultList), 
  getArchivedMedia: () => publicAxios.get(API.media.archived), // /media/archived/

  // -------- Filtered lists --------
  byEndpoint: (key) => {
    const urlMap = {
      home: API.media.home,            // /media/home/
      about: API.media.about,          // /media/about/
      decor: API.media.decor,          // /media/decor/
      liveBand: API.media.liveBand,    // /media/live-band/
      catering: API.media.catering,    // /media/catering/
      mediaHosting: API.media.mediaHosting, // /media/media-hosting/
      vendor: API.media.vendor,        // /media/vendor/
      partner: API.media.partner,      // /media/partner/
      user: API.media.user,            // /media/user/
      // ⚠️ partnerVendorDashboard is removed unless you add a DRF view for it
    };

    const url = urlMap[key];
    if (!url) throw new Error(`[mediaService] No URL found for key: ${key}`);
    return publicAxios.get(url);
  },

  // Explicit helpers
  getHomeMedia: () => mediaService.byEndpoint("home"),
  getAboutMedia: () => mediaService.byEndpoint("about"),
  getDecorMedia: () => mediaService.byEndpoint("decor"),
  getLiveBandMedia: () => mediaService.byEndpoint("liveBand"),
  getCateringMedia: () => mediaService.byEndpoint("catering"),
  getMediaHostingMedia: () => mediaService.byEndpoint("mediaHosting"),
  getVendorMedia: () => mediaService.byEndpoint("vendor"),
  getPartnerMedia: () => mediaService.byEndpoint("partner"),
  getUserMedia: () => mediaService.byEndpoint("user"),

  // -------- Mutations --------
  uploadMedia: (data) => axiosInstance.post(API.media.upload, data),
  updateMedia: (id, data) => axiosInstance.patch(API.media.update(id), data),
  toggleMediaActive: (id) => axiosInstance.post(API.media.toggle(id)),
  toggleMediaFeatured: (id) => axiosInstance.post(API.media.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.media.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.media.restore(id)),

  // -------- Utils --------
  reorderMedia: (data) => axiosInstance.post(API.media.reorder, data),
  getMediaStats: () => axiosInstance.get(API.media.stats),
  debugMediaProto: () => axiosInstance.get(API.media.debugProto),
};

export default mediaService;
