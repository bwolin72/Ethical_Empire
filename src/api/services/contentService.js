// src/api/services/contentService.js
import videosAPI from "../videosAPI";
import mediaAPI from "../mediaAPI";
import reviewsAPI from "../reviewsAPI";
import promotionsAPI from "../promotionsAPI";

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
  endpoints: v?.endpoints || [],
});

const normalizePromotion = (p = {}) => ({
  id: p?.id ?? null,
  title: p?.title || "",
  description: p?.description || "",
  imageUrl: p?.image || p?.image_url || null,
  videoUrl: p?.video || p?.video_url || null,
  html: p?.html_content || "",
  is_active: p?.is_active ?? true,
  is_active_override: p?.is_active_override ?? false,
  start_time: p?.start_time || null,
  end_time: p?.end_time || null,
  created_at: p?.created_at || null,
});

const normalizeReview = (r = {}) => ({
  id: r?.id ?? null,
  author: r?.user?.username || r?.author || r?.name || "Anonymous",
  rating: r?.rating ?? null,
  content: r?.content || r?.text || r?.comment || "",
  reply: r?.reply || null,
  approved: r?.approved ?? false,
  created_at: r?.created_at || null,
});

const normalizeMedia = (m = {}) => ({
  id: m?.id ?? null,
  title: m?.title || m?.label || "",
  url: m?.url?.full || m?.file_url || m?.image_url || m?.url || "",
  type: m?.type || "image",
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
      live_band: videosAPI.live_band,
      catering: videosAPI.catering,
      media_hosting: videosAPI.media_hosting,
      vendor: videosAPI.vendor,
      partner: videosAPI.partner,
      user: videosAPI.user,
      partner_dashboard: videosAPI.partner_dashboard,
      agency_dashboard: videosAPI.agency_dashboard,
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
  async getPromotions(params = {}) {
    try {
      const res = await promotionsAPI.list(params);
      return normalizeResponse(res, normalizePromotion);
    } catch (err) {
      console.error("❌ Error fetching promotions:", err);
      return normalizeError(err);
    }
  },

  // -------- Reviews --------
  async getReviews(params = {}) {
    try {
      const res = await reviewsAPI.list(params);
      return normalizeResponse(res, normalizeReview);
    } catch (err) {
      console.error("❌ Error fetching reviews:", err);
      return normalizeError(err);
    }
  },

  // -------- Media --------
  async getMedia(params = {}) {
    const { endpoint, ...rest } = params;
    const endpointMap = {
      banners: mediaAPI.banner,
      catering: mediaAPI.catering,
      decor: mediaAPI.decor,
      featured: mediaAPI.featured,
      home: mediaAPI.home,
      live_band: mediaAPI.live_band,
      media_hosting: mediaAPI.media_hosting,
      partner_vendor_dashboard: mediaAPI.partnerVendorDashboard,
      partner: mediaAPI.partner,
      user: mediaAPI.user,
      vendor: mediaAPI.vendor,
      all: mediaAPI.all,
      archived: mediaAPI.archived,
      about: mediaAPI.about,
      default: mediaAPI.list,
    };
    const fn = endpointMap[endpoint] || endpointMap.default;
    try {
      const res = await fn(rest);
      return normalizeResponse(res, normalizeMedia);
    } catch (err) {
      console.error(`❌ Error fetching media (${endpoint || "default"}):`, err);
      return normalizeError(err);
    }
  },
};

export default contentService;
