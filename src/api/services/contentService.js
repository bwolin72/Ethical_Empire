// src/api/services/contentService.js
import publicAxios from "../publicAxios";
import videosAPI from "../videosAPI";
import mediaAPI from "../mediaAPI";

// --- Normalizers ---
const normalizeVideo = (v = {}) => ({
  id: v?.id ?? null,
  title: v?.title || v?.name || "",
  description: v?.description || "",
  url: v?.video_url || v?.file_url || v?.url || "",
  thumbnail: v?.thumbnail || v?.image_url || null,
  is_featured: v?.is_featured ?? false,
  is_active: v?.is_active ?? true,
  created_at: v?.created_at || null,
  updated_at: v?.updated_at || null,
  category: v?.category || v?.type || null,
  tags: Array.isArray(v?.tags) ? v.tags : [],
});

const normalizePromotion = (p = {}) => ({
  id: p?.id ?? null,
  title: p?.title || "",
  description: p?.description || "",
  imageUrl: p?.image_url || p?.image || null,
  videoUrl: p?.video_url || p?.video || null,
  html: p?.html_content || "",
  is_active: p?.is_active ?? true,
  created_at: p?.created_at || null,
});

const normalizeReview = (r = {}) => ({
  id: r?.id ?? null,
  author: r?.author || r?.name || "Anonymous",
  rating: r?.rating ?? null,
  content: r?.content || r?.text || r?.comment || "",
  created_at: r?.created_at || null,
});

const normalizeMedia = (m = {}) => ({
  id: m?.id ?? null,
  title: m?.label || m?.title || "",
  url: m?.url?.full || m?.file_url || m?.image_url || m?.url || "",
  type: m?.file_type || "image",
  is_active: m?.is_active ?? true,
});

// --- Helpers ---
const safeMap = (data, normalizer) =>
  Array.isArray(data) ? data.map(normalizer) : [];

// --- Service ---
const contentService = {
  // -------- Videos --------
  getVideos: async (params = {}) => {
    try {
      const { endpoint, ...rest } = params;
      let res;

      switch (endpoint) {
        case "home":
          res = await videosAPI.home(rest);
          break;
        case "about":
          res = await videosAPI.about(rest);
          break;
        case "decor":
          res = await videosAPI.decor(rest);
          break;
        case "live_band":
          res = await videosAPI.liveBand(rest);
          break;
        case "catering":
          res = await videosAPI.catering(rest);
          break;
        case "media_hosting":
          res = await videosAPI.mediaHosting(rest);
          break;
        case "vendor":
          res = await videosAPI.vendor(rest);
          break;
        case "partner":
          res = await videosAPI.partner(rest);
          break;
        case "user":
          res = await videosAPI.user(rest);
          break;
        case "partner_dashboard":
          res = await videosAPI.partnerDashboard(rest);
          break;
        case "agency_dashboard":
          res = await videosAPI.agencyDashboard(rest);
          break;
        default:
          res = await videosAPI.list(rest);
      }

      return safeMap(res?.data, normalizeVideo);
    } catch (err) {
      console.error("Error fetching videos:", err);
      return [];
    }
  },

  // -------- Promotions --------
  getPromotions: async () => {
    try {
      const res = await publicAxios.get("/promotions/");
      return safeMap(res?.data, normalizePromotion);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      return [];
    }
  },

  // -------- Reviews --------
  getReviews: async () => {
    try {
      const res = await publicAxios.get("/reviews/");
      return safeMap(res?.data, normalizeReview);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return [];
    }
  },

  // -------- Media --------
  getBanners: async () => {
    try {
      const res = await publicAxios.get(mediaAPI.endpoints.banners);
      return safeMap(res?.data, normalizeMedia);
    } catch (err) {
      console.error("Error fetching banners:", err);
      return [];
    }
  },

  getMedia: async () => {
    try {
      const res = await publicAxios.get(mediaAPI.endpoints.defaultList);
      return safeMap(res?.data, normalizeMedia);
    } catch (err) {
      console.error("Error fetching media:", err);
      return [];
    }
  },
};

export default contentService;
