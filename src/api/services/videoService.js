// src/api/services/videoService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import videosAPI from "../videosAPI";
import endpointMap from "./endpointMap"; // optional central mapping (frontend)

/**
 * Ensure a URL uses HTTPS and handle protocol-relative URLs.
 */
const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://res.cloudinary.com")) return trimmed.replace("http://", "https://");
  return trimmed;
};

/**
 * Normalize common shapes returned by video serializers:
 * - item.url.full / item.url.thumb (like media)
 * - item.video_file (string or object with .url)
 * - item.thumbnail (string or object with .url)
 * - item.urls.{full,thumb}
 */
const normalizeVideoItem = (item) => {
  if (!item || typeof item !== "object") return item;

  // url object like media items
  if (item.url && typeof item.url === "object") {
    if (item.url.full) item.url.full = ensureHttps(item.url.full);
    if (item.url.thumb) item.url.thumb = ensureHttps(item.url.thumb);
  }

  // common Cloudinary-backed fields
  const normalizeField = (field) => {
    if (!item[field]) return;
    if (typeof item[field] === "string") {
      item[field] = ensureHttps(item[field]);
    } else if (typeof item[field] === "object" && item[field].url) {
      item[field].url = ensureHttps(item[field].url);
    }
  };

  normalizeField("video_file");
  normalizeField("video");
  normalizeField("file");
  normalizeField("video_url");
  normalizeField("thumbnail");
  normalizeField("thumb");

  // possible urls container
  if (item.urls && typeof item.urls === "object") {
    if (item.urls.full) item.urls.full = ensureHttps(item.urls.full);
    if (item.urls.thumb) item.urls.thumb = ensureHttps(item.urls.thumb);
  }

  return item;
};

/**
 * Normalize an API response (array, paginated {results: []} or single object)
 */
const normalizeVideoResponse = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(normalizeVideoItem);
  if (data.results && Array.isArray(data.results)) {
    return { ...data, results: data.results.map(normalizeVideoItem) };
  }
  return normalizeVideoItem(data);
};

/* ---------------------------
   Endpoint canonical map
   (tolerant keys -> videosAPI endpoints)
   --------------------------- */
const canonicalEndpointMap = {
  // home
  eethmhome: videosAPI.home,
  home: videosAPI.home,
  "eethm-home": videosAPI.home,

  // about
  about: videosAPI.about,
  "about-page": videosAPI.about,

  // decor
  decor: videosAPI.decor,
  "decor-page": videosAPI.decor,
  decorservicepage: videosAPI.decor,

  // live band
  liveband: videosAPI.liveBand,
  "live-band": videosAPI.liveBand,
  "live_band": videosAPI.liveBand,
  livebandservicepage: videosAPI.liveBand,
  "live-band-service": videosAPI.liveBand,

  // catering
  catering: videosAPI.catering,
  "catering-page": videosAPI.catering,
  cateringservicepage: videosAPI.catering,

  // media hosting
  "media-hosting": videosAPI.mediaHosting,
  mediahosting: videosAPI.mediaHosting,
  "media_hosting": videosAPI.mediaHosting,
  mediahostingservicepage: videosAPI.mediaHosting,

  // profiles
  vendor: videosAPI.vendor,
  "vendor-profile": videosAPI.vendor,
  partner: videosAPI.partner,
  "partner-profile": videosAPI.partner,
  user: videosAPI.user,
  "user-page": videosAPI.user,

  // partner/vendor dashboard
  "partner-vendor-dashboard": videosAPI.partnerVendorDashboard,
  partner_vendor_dashboard: videosAPI.partnerVendorDashboard,
  partnervendordashboard: videosAPI.partnerVendorDashboard,
  agencydashboard: videosAPI.partnerVendorDashboard,
  "partner_dashboard": videosAPI.partnerVendorDashboard,
};

/* ---------------------------
   Candidate builder (tries many normalized forms)
   --------------------------- */
const buildCandidates = (raw) => {
  if (!raw) return [];
  const s = String(raw).trim();
  // If endpointMap maps this, prefer its value
  const fromEndpointMap = endpointMap && endpointMap[raw] ? String(endpointMap[raw]) : null;

  const lower = s.toLowerCase();
  const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const alnum = lower.replace(/[^a-z0-9]/g, "");
  const noSuffix = lower.replace(/(page|service|servicepage|service-page|page)$/g, "").replace(/(^-|-$)/g, "");
  const noSuffixAlnum = noSuffix.replace(/[^a-z0-9]/g, "");
  const underscored = lower.replace(/[-\s]+/g, "_");

  const pascalLike = s.replace(/[^a-zA-Z0-9]/g, "");

  // prioritized, uniq
  const arr = [fromEndpointMap, s, lower, slug, underscored, alnum, noSuffix, noSuffixAlnum, pascalLike]
    .filter(Boolean)
    .map(String);

  return [...new Set(arr)];
};

/* Resolve a videosAPI URL for a given endpoint token */
const resolveVideosApiUrl = (endpoint) => {
  if (!endpoint) return videosAPI.list;

  const candidates = buildCandidates(endpoint);

  for (const cand of candidates) {
    if (canonicalEndpointMap.hasOwnProperty(cand)) return canonicalEndpointMap[cand];

    // check if videosAPI has a key matching cand (case-insensitive)
    const apiKey = Object.keys(videosAPI).find((k) => k.toLowerCase() === cand.toLowerCase());
    if (apiKey && videosAPI[apiKey]) return videosAPI[apiKey];
  }

  // if endpoint itself is an absolute path or URL — use it
  if (typeof endpoint === "string" && (endpoint.startsWith("/") || endpoint.startsWith("http://") || endpoint.startsWith("https://"))) {
    return endpoint;
  }

  // fallback
  return videosAPI.list;
};

const videoService = {
  /* ---------------- Public ---------------- */
  // generic list with optional params (e.g. { is_active: true, page_size: 1 })
  getVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.list, { params });
    return normalizeVideoResponse(res.data);
  },

  getHomeVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.home, { params });
    return normalizeVideoResponse(res.data);
  },

  getAboutVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.about, { params });
    return normalizeVideoResponse(res.data);
  },

  getDecorVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.decor, { params });
    return normalizeVideoResponse(res.data);
  },

  getLiveBandVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.liveBand, { params });
    return normalizeVideoResponse(res.data);
  },

  getCateringVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.catering, { params });
    return normalizeVideoResponse(res.data);
  },

  getMediaHostingVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.mediaHosting, { params });
    return normalizeVideoResponse(res.data);
  },

  getVendorVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.vendor, { params });
    return normalizeVideoResponse(res.data);
  },

  getPartnerVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.partner, { params });
    return normalizeVideoResponse(res.data);
  },

  getUserVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.user, { params });
    return normalizeVideoResponse(res.data);
  },

  getPartnerVendorDashboardVideos: async (params = {}) => {
    const res = await publicAxios.get(videosAPI.partnerVendorDashboard, { params });
    return normalizeVideoResponse(res.data);
  },

  /* ---------------- Admin ---------------- */
  uploadVideo: (formData) => axiosInstance.post(videosAPI.upload, formData),
  updateVideo: (id, payload) => axiosInstance.patch(videosAPI.update(id), payload),
  deleteVideo: (id) => axiosInstance.delete(videosAPI.delete(id)),
  toggleActive: (id) => axiosInstance.post(videosAPI.toggle(id)),
  toggleFeatured: (id) => axiosInstance.post(videosAPI.toggleFeatured(id)),

  /* ---------------- Dynamic resolver (byEndpoint) ----------------
     Accepts:
       - endpoint string (PascalCase / slug / lowercase / underscore)
       - a value that endpointMap maps to canonical name
       - full URL or absolute path
     Optional params object is forwarded as query params (e.g. { is_active: true, page_size: 1 })
  --------------------------------------------------------------- */
  byEndpoint: async (endpoint, params = {}) => {
    try {
      // If endpointMap returns a canonical name, prefer that
      const mapped = endpointMap && endpointMap[endpoint] ? endpointMap[endpoint] : endpoint;
      const apiUrl = resolveVideosApiUrl(mapped);
      const res = await publicAxios.get(apiUrl, { params });
      return normalizeVideoResponse(res.data);
    } catch (err) {
      // Let caller handle/log errors
      throw err;
    }
  },

  /* Compatibility & aliases */
  list: (params = {}) => publicAxios.get(videosAPI.list, { params }),
  debugProto: () => axiosInstance.get(videosAPI.upload), // placeholder if needed
};

export default videoService;
