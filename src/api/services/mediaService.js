// src/api/services/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../mediaAPI";
import endpointMap from "./endpointMap";

/**
 * Normalize Cloudinary URLs to HTTPS
 */
const normalizeCloudinaryUrls = (data) => {
  if (!data) return data;

  const normalizeItem = (item) => {
    if (!item || typeof item !== "object") return item;
    if (item.url) {
      if (item.url.full?.startsWith("http://res.cloudinary.com")) {
        item.url.full = item.url.full.replace("http://", "https://");
      }
      if (item.url.thumb?.startsWith("http://res.cloudinary.com")) {
        item.url.thumb = item.url.thumb.replace("http://", "https://");
      }
    }
    return item;
  };

  if (Array.isArray(data)) return data.map(normalizeItem);
  if (data?.results) return { ...data, results: data.results.map(normalizeItem) };
  return normalizeItem(data);
};

/**
 * Resolve API URL for a frontend endpoint identifier
 */
const resolveApiUrlForEndpoint = (endpoint) => {
  if (!endpoint) return API.defaultList;

  const candidates = [endpointMap?.[endpoint], endpoint, endpoint.toLowerCase()]
    .filter(Boolean)
    .map((c) => c.toString());

  for (const cand of candidates) {
    if (API[cand]) return API[cand];
  }

  if (typeof endpoint === "string" && (endpoint.startsWith("/") || endpoint.startsWith("http"))) {
    return endpoint;
  }

  return API.defaultList;
};

const mediaService = {
  // -------- Public methods --------
  list: () => publicAxios.get(API.defaultList).then((res) => normalizeCloudinaryUrls(res.data)),
  getMedia: () => publicAxios.get(API.defaultList).then((res) => normalizeCloudinaryUrls(res.data)),
  getBanners: () => publicAxios.get(API.banners).then((res) => normalizeCloudinaryUrls(res.data)),
  getFeatured: () => publicAxios.get(API.featured).then((res) => normalizeCloudinaryUrls(res.data)),
  byEndpoint: async (endpoint) => {
    const url = resolveApiUrlForEndpoint(endpoint);
    const res = await publicAxios.get(url);
    return normalizeCloudinaryUrls(res.data);
  },

  // -------- Admin / Auth methods --------
  uploadMedia: (formData) => axiosInstance.post(API.upload, formData),
  getAllMedia: () => axiosInstance.get(API.all),
  updateMedia: (id, payload) => axiosInstance.patch(API.update(id), payload),
  toggleActive: (id) => axiosInstance.post(API.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(API.toggleFeatured(id)),
  deleteMedia: (id) => axiosInstance.delete(API.delete(id)),
  restoreMedia: (id) => axiosInstance.post(API.restore(id)),
  getArchivedMedia: () => axiosInstance.get(API.archived),
  reorderMedia: (payload) => axiosInstance.post(API.reorder, payload),
  getMediaStats: () => axiosInstance.get(API.stats),

  // -------- Debug --------
  debugProto: () => axiosInstance.get(API.debugProto),
};

export default mediaService;
