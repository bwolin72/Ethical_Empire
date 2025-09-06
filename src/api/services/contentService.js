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
  getVideos: async (params) => {
    const res = await videosAPI.getAll(params); // <--- corrected
    return Array.isArray(res.data) ? res.data.map(normalizeVideo) : [];
  },

  // -------- Promotions --------
  getPromotions: async () => {
    const res = await publicAxios.get("/promotions/");
    return Array.isArray(res.data) ? res.data.map(normalizePromotion) : [];
  },

  // -------- Reviews --------
  getReviews: async () => {
    const res = await publicAxios.get("/reviews/");
    return Array.isArray(res.data) ? res.data.map(normalizeReview) : [];
  },

  // -------- Media --------
  getBanners: async () => {
    const res = await publicAxios.get(mediaAPI.endpoints.banners);
    return Array.isArray(res.data) ? res.data.map(normalizeMedia) : [];
  },

  getMedia: async () => {
    const res = await publicAxios.get(mediaAPI.endpoints.defaultList);
    return Array.isArray(res.data) ? res.data.map(normalizeMedia) : [];
  },
};

export default contentService;
