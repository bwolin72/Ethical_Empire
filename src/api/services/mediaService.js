// src/api/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../api";
import endpointMap from "./endpointMap";

const mediaService = {
  // -------- Public-facing --------
  getMedia: () => publicAxios.get(API.media.defaultList),
  getBanners: () => publicAxios.get(API.media.banners),
  getFeaturedMedia: () => publicAxios.get(API.media.featured),

  // -------- Admin & management --------
  getAllMedia: () => publicAxios.get(API.media.all),
  getArchivedMedia: () => publicAxios.get(API.media.archived),

  // -------- Filtered lists (dynamic via endpointMap) --------
  byEndpoint: (key) => {
    const path = endpointMap[key];
    if (!path) throw new Error(`[mediaService] Unknown endpoint: ${key}`);
    return publicAxios.get(`${API.media.base}/${path}`);
  },

  // Still keep explicit helpers if you want backwards compatibility:
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
