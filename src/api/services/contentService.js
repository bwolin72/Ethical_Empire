// src/api/services/contentService.js
import publicAxios from "../publicAxios";
import videosAPI from "../videosAPI";
import mediaAPI from "../mediaAPI";

// --- Normalizers ---
const normalizeVideo = (v) => ({
  id: v.id,
  title: v.title || v.name || "",
  description: v.description || "",
  url: v.video_url || v.file_url || v.url || "",
  thumbnail: v.thumbnail || v.image_url || null,
});

const normalizePromotion = (p) => ({
  id: p.id,
  title: p.title || "",
  description: p.description || "",
  imageUrl: p.image_url || p.image || null,
  videoUrl: p.video_url || p.video || null,
  html: p.html_content || "",
});

const normalizeReview = (r) => ({
  id: r.id,
  author: r.author || r.name || "Anonymous",
  rating: r.rating ?? null,
  content: r.content || r.text || "",
});

const normalizeMedia = (m) => ({
  id: m.id,
  title: m.label || m.title || "",
  url: m.url?.full || m.file_url || m.image_url || "",
  type: m.file_type || "image",
});

// --- Service ---
const contentService = {
  // -------- Videos --------
  getVideos: async (params = {}) => {
    try {
      let res;

      // Pick API based on endpoint
      switch (params.endpoint) {
        case "home":
          res = await videosAPI.home(params);
          break;
        case "about":
          res = await videosAPI.about(params);
          break;
        case "decor":
          res = await videosAPI.decor(params);
          break;
        case "live_band":
          res = await videosAPI.liveBand(params);
          break;
        case "catering":
          res = await videosAPI.catering(params);
          break;
        case "media_hosting":
          res = await videosAPI.mediaHosting(params);
          break;
        case "vendor":
          res = await videosAPI.vendor(params);
          break;
        case "partner":
          res = await videosAPI.partner(params);
          break;
        case "user":
          res = await videosAPI.user(params);
          break;
        case "partner_dashboard":
          res = await videosAPI.partnerDashboard(params);
          break;
        case "agency_dashboard":
          res = await videosAPI.agencyDashboard(params);
          break;
        default:
          res = await videosAPI.list(params);
      }

      return Array.isArray(res.data) ? res.data.map(normalizeVideo) : [];
    } catch (err) {
      console.error("Error fetching videos:", err);
      return [];
    }
  },

  // -------- Promotions --------
  getPromotions: async () => {
    try {
      const res = await publicAxios.get("/promotions/");
      return Array.isArray(res.data) ? res.data.map(normalizePromotion) : [];
    } catch (err) {
      console.error("Error fetching promotions:", err);
      return [];
    }
  },

  // -------- Reviews --------
  getReviews: async () => {
    try {
      const res = await publicAxios.get("/reviews/");
      return Array.isArray(res.data) ? res.data.map(normalizeReview) : [];
    } catch (err) {
      console.error("Error fetching reviews:", err);
      return [];
    }
  },

  // -------- Media --------
  getBanners: async () => {
    try {
      const res = await publicAxios.get(mediaAPI.endpoints.banners);
      return Array.isArray(res.data) ? res.data.map(normalizeMedia) : [];
    } catch (err) {
      console.error("Error fetching banners:", err);
      return [];
    }
  },

  getMedia: async () => {
    try {
      const res = await publicAxios.get(mediaAPI.endpoints.defaultList);
      return Array.isArray(res.data) ? res.data.map(normalizeMedia) : [];
    } catch (err) {
      console.error("Error fetching media:", err);
      return [];
    }
  },
};

export default contentService;
