// src/api/services/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import mediaAPI from "../mediaAPI";

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

const mediaService = {
  // -------- Public (no auth) --------
  list: (params) =>
    publicAxios.get(mediaAPI.list, { params }).then((res) => normalizeCloudinaryUrls(res.data)),

  banners: (params) =>
    publicAxios.get(mediaAPI.banner, { params }).then((res) => normalizeCloudinaryUrls(res.data)),

  featured: (params) =>
    publicAxios.get(mediaAPI.featured, { params }).then((res) => normalizeCloudinaryUrls(res.data)),

  home: (params) =>
    publicAxios.get(mediaAPI.home, { params }).then((res) => normalizeCloudinaryUrls(res.data)),

  // -------- Authenticated (admin / dashboard) --------
  upload: (formData) => axiosInstance.post(mediaAPI.upload, formData),
  all: (params) => axiosInstance.get(mediaAPI.all, { params }),
  update: (id, payload) => axiosInstance.patch(mediaAPI.update(id), payload),
  toggleActive: (id) => axiosInstance.post(mediaAPI.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(mediaAPI.toggleFeatured(id)),
  delete: (id) => axiosInstance.delete(mediaAPI.delete(id)),
  restore: (id) => axiosInstance.post(mediaAPI.restore(id)),
  archived: (params) => axiosInstance.get(mediaAPI.archived, { params }),
  reorder: (payload) => axiosInstance.post(mediaAPI.reorder, payload),
  stats: () => axiosInstance.get(mediaAPI.stats),
};

export default mediaService;
