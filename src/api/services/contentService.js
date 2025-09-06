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

// --- Helpers ---
const safeMap = (data, normalizer) =>
  Array.isArray(data) ? data.map(normalizer) : [];

const fetchAndNormalize = async (fn, normalizer) => {
  try {
    const res = await fn();
    return safeMap(res?.data, normalizer);
  } catch (err) {
    console.error("API fetch error:", err);
    return [];
  }
};

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

  // 👇 Wrapper for useFetcher compatibility
  getVideosByEndpoint: async (endpoint, params = {}) =>
    contentService.getVideos({ endpoint, ...params }),

  // -------- Promotions --------
  getPromotions: () =>
    fetchAndNormalize(() => publicAxios.get("/promotions/"), normalizePromotion),

  // -------- Reviews --------
  getReviews: () =>
    fetchAndNormalize(() => publicAxios.get("/reviews/"), normalizeReview),

  // -------- Media --------
  getBanners: () =>
    fetchAndNormalize(
      () => publicAxios.get(mediaAPI.endpoints.banners),
      normalizeMedia
    ),

  getMedia: () =>
    fetchAndNormalize(
      () => publicAxios.get(mediaAPI.endpoints.defaultList),
      normalizeMedia
    ),

  // 👇 Wrapper for useFetcher compatibility
  getMediaByEndpoint: async (endpoint) => {
    if (!endpoint) {
      return contentService.getMedia();
    }
    return fetchAndNormalize(() => publicAxios.get(endpoint), normalizeMedia);
  },
};

export default contentService;
