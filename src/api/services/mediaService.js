// src/api/services/mediaService.js
import publicAxios from "../publicAxios";
import axiosInstance from "../axiosInstance";
import API from "../mediaAPI";
import endpointMap from "./endpointMap"; // central map (optional helper provided elsewhere)

/**
 * Helper: force Cloudinary URLs to HTTPS and normalize result shapes
 */
const normalizeCloudinaryUrls = (data) => {
  if (!data) return data;

  const normalizeItem = (item) => {
    if (!item || typeof item !== "object") return item;
    if (item.url) {
      if (typeof item.url.full === "string" && item.url.full.startsWith("http://res.cloudinary.com")) {
        item.url.full = item.url.full.replace("http://", "https://");
      }
      if (typeof item.url.thumb === "string" && item.url.thumb.startsWith("http://res.cloudinary.com")) {
        item.url.thumb = item.url.thumb.replace("http://", "https://");
      }
    }
    return item;
  };

  if (Array.isArray(data)) {
    return data.map(normalizeItem);
  } else if (data && Array.isArray(data.results)) {
    return { ...data, results: data.results.map(normalizeItem) };
  } else {
    return normalizeItem(data);
  }
};

/**
 * Core map tying friendly frontend endpoint names to API URLs from mediaAPI
 * (single source-of-truth). Add any extra canonical mappings here.
 */
const canonicalEndpointMap = {
  // homepage / main
  eethmhome: API.home,
  home: API.home,
  "eethm-home": API.home,
  // about
  about: API.about,
  "about-page": API.about,
  // decor
  decor: API.decor,
  // live band
  "live-band": API.liveBand,
  liveband: API.liveBand,
  "live-band-service": API.liveBand,
  // catering
  catering: API.catering,
  "catering-page": API.catering,
  // media hosting
  "media-hosting": API.mediaHosting,
  "mediahosting": API.mediaHosting,
  "media-hosting-service": API.mediaHosting,
  // vendor / partner / user
  vendor: API.vendor,
  "vendor-profile": API.vendor,
  partner: API.partner,
  "partner-profile": API.partner,
  user: API.user,
  "user-page": API.user,
  // partner-vendor dashboard / agency dashboard
  "partner-vendor-dashboard": API.partnerVendorDashboard,
  partnervendordashboard: API.partnerVendorDashboard,
  agencydashboard: API.partnerVendorDashboard,
  // special lists
  banners: API.banners,
  featured: API.featured,
};

/**
 * Build candidate keys from an incoming endpoint identifier.
 * Accepts PascalCase, lower, slug, with/without suffixes.
 */
const buildCandidates = (raw) => {
  if (!raw || typeof raw !== "string") return [];

  const s = raw.trim();

  // If endpointMap maps this key, use that value first (consumer of endpointMap may return a canonical name)
  const mappedFromEndpointMap = endpointMap && endpointMap[raw] ? String(endpointMap[raw]) : null;

  // base normalized forms
  const lower = s.toLowerCase();
  const alnum = lower.replace(/[^a-z0-9]/g, ""); // remove non-alphanumeric
  const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const noSuffix = lower.replace(/(page|service|servicepage|service-page|page)$/g, "").replace(/(^-|-$)/g, "");
  const noSuffixAlnum = noSuffix.replace(/[^a-z0-9]/g, "");

  // also include PascalCase-style (remove non-alnum but keep case-insensitively checked)
  const pascalLike = s.replace(/[^a-zA-Z0-9]/g, "");

  // gather unique candidates in prioritized order
  const candidates = [
    mappedFromEndpointMap,
    s,
    lower,
    slug,
    alnum,
    noSuffix,
    noSuffixAlnum,
    pascalLike,
  ]
    .filter(Boolean)
    .map((c) => String(c))
    .reduce((acc, cur) => {
      if (!acc.includes(cur)) acc.push(cur);
      return acc;
    }, []);

  return candidates;
};

/**
 * Resolve an API URL (from mediaAPI constants) for a frontend endpoint identifier.
 * Returns the resolved API URL string; falls back to API.defaultList.
 */
const resolveApiUrlForEndpoint = (endpoint) => {
  if (!endpoint) return API.defaultList;

  const candidates = buildCandidates(endpoint);

  for (const cand of candidates) {
    // direct hit on canonical map (keys are normalized)
    if (canonicalEndpointMap.hasOwnProperty(cand)) {
      return canonicalEndpointMap[cand];
    }

    // if candidate equals an API key name (e.g., "home", "about" etc), check API object for that key
    const apiKey = Object.keys(API).find((k) => k.toLowerCase() === cand.toLowerCase());
    if (apiKey && API[apiKey]) {
      return API[apiKey];
    }
  }

  // last-resort: if endpoint looks like a full URL (starts with http or /), try to use it directly.
  if (typeof endpoint === "string" && (endpoint.startsWith("http://") || endpoint.startsWith("https://") || endpoint.startsWith("/"))) {
    return endpoint;
  }

  // fallback to default list
  return API.defaultList;
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

  // -------- Section-specific (public) convenience methods --------
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

  /**
   * byEndpoint: primary dynamic resolver used by frontend components.
   * Accepts:
   *   - PascalCase keys (e.g. "LiveBandServicePage")
   *   - lowercase keys (e.g. "livebandservicepage" or "about")
   *   - slug keys (e.g. "live-band", "media-hosting")
   *   - values returned by endpointMap (frontend-level mapping)
   *   - a full URL or absolute path (will be requested as-is)
   */
  byEndpoint: async (endpoint) => {
    try {
      // endpointMap (if present) often maps route keys to canonical names — prefer that
      const mapped = endpointMap && endpointMap[endpoint] ? endpointMap[endpoint] : endpoint;
      const apiUrl = resolveApiUrlForEndpoint(mapped);
      const res = await publicAxios.get(apiUrl);
      return normalizeCloudinaryUrls(res.data);
    } catch (err) {
      // bubble the error so callers can handle logging / fallback
      throw err;
    }
  },

  // Legacy shorthands
  list: () => publicAxios.get(API.defaultList),
  stats: () => axiosInstance.get(API.stats),
};

export default mediaService;
