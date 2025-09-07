// src/api/services/contentService.js
import publicAxios from "../publicAxios";
import videosAPI from "../videosAPI";
import mediaAPI from "../mediaAPI";

// -------------------------
// Normalizers
// -------------------------
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
  tags: Array.isArray(v?.tags)
    ? v.tags
    : typeof v?.tags === "string"
      ? v.tags.split(",").map((t) => t.trim())
      : [],
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

// -------------------------
// Helpers
// -------------------------
const safeMap = (data, normalizer) =>
  Array.isArray(data) ? data.map(normalizer) : [];

function normalizeResponse(res, normalizer) {
  if (!res) return { data: [], status: null, error: "No response" };
  return {
    data: safeMap(res?.data, normalizer),
    status: res?.status ?? 200,
    error: null,
  };
}

function normalizeError(err) {
  return {
    data: [],
    status: err?.response?.status || null,
    error: err?.response?.data?.detail || err.message || "Request failed",
  };
}

// -------------------------
// Service
// -------------------------
const contentService = {
  // -------- Videos --------
  async getVideos(params = {}) {
    const { endpoint, ...rest } = params;

    const endpointMap = {
      home: videosAPI.home,
      about: videosAPI.about,
      decor: videosAPI.decor,
      live_band: videosAPI.liveBand,
      catering: videosAPI.catering,
      media_hosting: videosAPI.mediaHosting,
      vendor: videosAPI.vendor,
      partner: videosAPI.partner,
      user: videosAPI.user,
      partner_dashboard: videosAPI.partnerDashboard,
      agency_dashboard: videosAPI.agencyDashboard,
      default: videosAPI.list,
    };

    const fn = endpointMap[endpoint] || endpointMap.default;

    try {
      const res = await fn(rest);
      return normalizeResponse(res, normalizeVideo);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
      return normalizeError(err);
    }
  },

  // -------- Promotions --------
  async getPromotions() {
    try {
      const res = await publicAxios.get("/promotions/");
      return normalizeResponse(res, normalizePromotion);
    } catch (err) {
      console.error("❌ Error fetching promotions:", err);
      return normalizeError(err);
    }
  },

  // -------- Reviews --------
  async getReviews() {
    try {
      const res = await publicAxios.get("/reviews/");
      return normalizeResponse(res, normalizeReview);
    } catch (err) {
      console.error("❌ Error fetching reviews:", err);
      return normalizeError(err);
    }
  },

  // -------- Media --------
  async getBanners() {
    try {
      const res = await publicAxios.get(mediaAPI.banners);
      return normalizeResponse(res, normalizeMedia);
    } catch (err) {
      console.error("❌ Error fetching banners:", err);
      return normalizeError(err);
    }
  },

  async getMedia() {
    try {
      const res = await publicAxios.get(mediaAPI.defaultList);
      return normalizeResponse(res, normalizeMedia);
    } catch (err) {
      console.error("❌ Error fetching media:", err);
      return normalizeError(err);
    }
  },
};

export default contentService;
