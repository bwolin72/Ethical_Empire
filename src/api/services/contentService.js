// src/api/services/contentService.js
import publicAxios from "../publicAxios";

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

const fetchAndNormalize = async (url, normalizer, params = {}) => {
  try {
    const res = await publicAxios.get(url, { params });
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
    const { endpoint, ...rest } = params;
    let url = "/api/videos/videos/";

    if (endpoint) {
      url = `/api/videos/videos/${endpoint}/`; // e.g. /api/videos/videos/home/
    }

    return fetchAndNormalize(url, normalizeVideo, rest);
  },

  // For useFetcher compatibility
  getVideosByEndpoint: async (endpoint, params = {}) =>
    contentService.getVideos({ endpoint, ...params }),

  // -------- Promotions --------
  getPromotions: () =>
    fetchAndNormalize("/api/promotions/", normalizePromotion),

  // -------- Reviews --------
  getReviews: () =>
    fetchAndNormalize("/api/reviews/", normalizeReview),

  // -------- Media --------
  getMedia: (params = {}) =>
    fetchAndNormalize("/api/media/", normalizeMedia, params),

  getMediaByEndpoint: async (endpoint, params = {}) => {
    // If your DRF MediaViewSet also has sub-actions like banners/featured,
    // you can mirror them here. Otherwise, just call getMedia.
    let url = "/api/media/";
    if (endpoint) {
      url = `/api/media/${endpoint}/`;
    }
    return fetchAndNormalize(url, normalizeMedia, params);
  },
};

export default contentService;
