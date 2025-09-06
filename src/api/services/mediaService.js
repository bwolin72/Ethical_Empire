// src/api/services/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../mediaAPI";
import endpointMap from "./endpointMap"; // central map

// --- Helper: force Cloudinary URLs to HTTPS ---
const normalizeCloudinaryUrls = (data) => {
  if (!data) return data;

  const normalizeItem = (item) => {
    if (item?.url) {
      if (item.url.full?.startsWith("http://res.cloudinary.com")) {
        item.url.full = item.url.full.replace("http://", "https://");
      }
      if (item.url.thumb?.startsWith("http://res.cloudinary.com")) {
        item.url.thumb = item.url.thumb.replace("http://", "https://");
      }
    }
    return item;
  };

  if (Array.isArray(data)) {
    return data.map(normalizeItem);
  } else if (data.results && Array.isArray(data.results)) {
    return { ...data, results: data.results.map(normalizeItem) };
  } else {
    return normalizeItem(data);
  }
};

const mediaService = {
  // -------- Public-facing --------
  getMedia: async () => {
    const res = await publicAxios.get(API.defaultList);
    return normalizeCloudinaryUrls(res.data);
  },
  getBanners: async () => {
    const res = await publicAxios.get(API.banners);
    return normalizeCloudinaryUrls(res.data);
  },
  getFeatured: async () => {
    const res = await publicAxios.get(API.featured);
    return normalizeCloudinaryUrls(res.data);
  },

  // -------- Section-specific (public) --------
  getVendorMedia: async () => {
    const res = await publicAxios.get(API.vendor);
    return normalizeCloudinaryUrls(res.data);
  },
  getPartnerMedia: async () => {
    const res = await publicAxios.get(API.partner);
    return normalizeCloudinaryUrls(res.data);
  },
  getUserMedia: async () => {
    const res = await publicAxios.get(API.user);
    return normalizeCloudinaryUrls(res.data);
  },
  getHomeMedia: async () => {
    const res = await publicAxios.get(API.home);
    return normalizeCloudinaryUrls(res.data);
  },
  getAboutMedia: async () => {
    const res = await publicAxios.get(API.about);
    return normalizeCloudinaryUrls(res.data);
  },
  getDecorMedia: async () => {
    const res = await publicAxios.get(API.decor);
    return normalizeCloudinaryUrls(res.data);
  },
  getLiveBandMedia: async () => {
    const res = await publicAxios.get(API.liveBand);
    return normalizeCloudinaryUrls(res.data);
  },
  getCateringMedia: async () => {
    const res = await publicAxios.get(API.catering);
    return normalizeCloudinaryUrls(res.data);
  },
  getMediaHosting: async () => {
    const res = await publicAxios.get(API.mediaHosting);
    return normalizeCloudinaryUrls(res.data);
  },
  getPartnerVendorDashboardMedia: async () => {
    const res = await publicAxios.get(API.partnerVendorDashboard);
    return normalizeCloudinaryUrls(res.data);
  },

  // -------- Admin-only --------
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

  // -------- Compatibility Aliases --------
  getFeaturedMedia: async () => {
    const res = await publicAxios.get(API.featured);
    return normalizeCloudinaryUrls(res.data);
  },

  // Dynamic by endpoint (frontend → backend)
  byEndpoint: async (endpoint) => {
    const normalized = endpointMap[endpoint];
    const map = {
      EethmHome: API.home,
      About: API.about,
      CateringServicePage: API.catering,
      LiveBandServicePage: API.liveBand,
      DecorServicePage: API.decor,
      MediaHostingServicePage: API.mediaHosting,
      VendorProfile: API.vendor,
      PartnerProfilePage: API.partner,
      AgencyDashboard: API.partnerVendorDashboard,
      UserPage: API.user,
    };

    const res = await publicAxios.get(map[normalized] || API.defaultList);
    return normalizeCloudinaryUrls(res.data);
  },

  // Legacy shorthands
  list: () => publicAxios.get(API.defaultList),
  stats: () => axiosInstance.get(API.stats),
};

export default mediaService;
