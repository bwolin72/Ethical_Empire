// src/api/services/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";
import endpointMap from "./endpointMap";

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.media.defaultList),
  getBanners: () => publicAxios.get(API.media.banners),
  getFeaturedMedia: () => publicAxios.get(API.media.featured),

  // ✅ Service Page fetcher (fix for LiveBandServicePage)
  getServicePage: (endpoint) => {
    // Special-case: LiveBandServicePage should map to slug `/media/live-band/`
    if (endpoint === "LiveBandServicePage") {
      return publicAxios.get(API.media.liveBand);
    }

    // Default flow → /api/media/?endpoint=SomeServicePage&is_active=true
    return publicAxios.get("/api/media/", {
      params: { endpoint, is_active: true },
    });
  },

  // -------- Admin --------
  getAllMedia: () => axiosInstance.get(API.media.all),
  getArchivedMedia: () => axiosInstance.get(API.media.archived),

  // -------- Filtered lists --------
  byEndpoint: (key) => {
    const code = endpointMap[key];
    if (!code) throw new Error(`[mediaService] Unknown endpoint: ${key}`);

    const urlMap = {
      home: API.media.home,
      about: API.media.about,
      decor: API.media.decor,
      liveBand: API.media.liveBand,
      catering: API.media.catering,
      mediaHosting: API.media.mediaHosting,
      vendor: API.media.vendor,
      partner: API.media.partner,
      partnerVendorDashboard: API.media.partnerVendorDashboard,
      user: API.media.user,
    };

    const url = urlMap[key];
    if (!url) throw new Error(`[mediaService] No URL found for key: ${key}`);
    return publicAxios.get(url);
  },

  // -------- Explicit helpers --------
  getHomeMedia: () => mediaService.byEndpoint("home"),
  getAboutMedia: () => mediaService.byEndpoint("about"),
  getDecorMedia: () => mediaService.byEndpoint("decor"),
  getLiveBandMedia: () => mediaService.byEndpoint("liveBand"),
  getCateringMedia: () => mediaService.byEndpoint("catering"),
  getMediaHostingMedia: () => mediaService.byEndpoint("mediaHosting"),
  getVendorMedia: () => mediaService.byEndpoint("vendor"),
  getPartnerMedia: () => mediaService.byEndpoint("partner"),
  getPartnerVendorDashboardMedia: () =>
    mediaService.byEndpoint("partnerVendorDashboard"),
  getUserMedia: () => mediaService.byEndpoint("user"),

  // -------- Mutations --------
  uploadMedia: (data) => axiosInstance.post(API.media.upload, data),
  updateMedia: (id, data) => axiosInstance.patch(API.media.update(id), data),
  toggleMediaActive: (id) => axiosInstance.post(API.media.toggle(id)),
  toggleMediaFeatured: (id) =>
    axiosInstance.post(API.media.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.media.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.media.restore(id)),

  // -------- Utils --------
  reorderMedia: (data) => axiosInstance.post(API.media.reorder, data),
  getMediaStats: () => axiosInstance.get(API.media.stats),
  debugMediaProto: () => axiosInstance.get(API.media.debugProto),
};

export default mediaService;
