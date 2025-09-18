import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

// Import all your API service modules
import mediaAPI from "../api/mediaAPI";
import videosAPI from "../api/videosAPI";
import promotionsAPI from "../api/promotionsAPI";
import reviewsAPI from "../api/reviewsAPI";
import newsletterAPI from "../api/newsletterAPI";
import invoicesAPI from "../api/invoicesAPI";
import bookingAPI from "../api/bookingAPI";
import authAPI from "../api/authAPI";
import messagingAPI from "../api/messagingAPI";
import contactAPI from "../api/contactAPI";
import serviceAPI from "../api/servicesAPI";
import workerAPI from "../api/workerAPI";

// Central API map
const API_MAP = {
  media: mediaAPI,
  videos: videosAPI,
  promotions: promotionsAPI,
  reviews: reviewsAPI,
  newsletter: newsletterAPI,
  invoices: invoicesAPI,
  bookings: bookingAPI,
  auth: authAPI,
  messaging: messagingAPI,
  contact: contactAPI,
  services: serviceAPI,
  workers: workerAPI,
};

/**
 * useFetcher hook
 *
 * Supports:
 *   1) useFetcher("videos", "all", params, options)
 *   2) useFetcher({ resourceType: "videos", key: "all" }, params, options)
 */
export default function useFetcher(resourceTypeOrEndpoint, endpointKeyOrParams, paramsOrOptions = {}, options = {}) {
  let resourceType, endpointKey, params;

  // -------------------------------
  // Parse arguments
  // -------------------------------
  if (typeof resourceTypeOrEndpoint === "string") {
    resourceType = resourceTypeOrEndpoint;
    endpointKey = endpointKeyOrParams;
    params = paramsOrOptions;
  } else if (typeof resourceTypeOrEndpoint === "object" && resourceTypeOrEndpoint.resourceType) {
    resourceType = resourceTypeOrEndpoint.resourceType;
    endpointKey = resourceTypeOrEndpoint.key;
    params = endpointKeyOrParams || {};
    options = paramsOrOptions || {};
  } else {
    throw new Error("[useFetcher] Invalid arguments");
  }

  const { notify, successMessages = {}, errorMessages = {}, transform, fallback = true } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // -------------------------------
  // Fetch Data
  // -------------------------------
  const fetchData = useCallback(async () => {
    const apiGroup = API_MAP[resourceType];
    if (!apiGroup || typeof apiGroup[endpointKey] !== "function") {
      const msg = `Unknown endpoint: ${resourceType}.${endpointKey}`;
      console.error("[useFetcher]", msg);
      mountedRef.current && setError({ message: msg });
      mountedRef.current && setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiGroup[endpointKey](params || {});
      let items = extractItems(res);

      // Fallbacks
      if (fallback && (!items || items.length === 0)) {
        if (resourceType === "videos") items = [fallbackVideoObject()];
        if (resourceType === "media") items = [fallbackBannerObject()];
      }

      mountedRef.current && setData(typeof transform === "function" ? transform(items) : items);
    } catch (err) {
      const normalizedError = {
        message: err.response?.data?.detail || err.message,
        status: err.response?.status || null,
        data: err.response?.data || null,
      };
      mountedRef.current && setError(normalizedError);
      mountedRef.current && setData([]);
    } finally {
      mountedRef.current && setLoading(false);
    }
  }, [resourceType, endpointKey, params, transform, fallback]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // -------------------------------
  // CRUD Mutations
  // -------------------------------
  const post = async (payload) => {
    try {
      const res = await axiosInstance.post(`/${resourceType}/`, payload);
      notify?.("success", successMessages.post || "Created successfully.");
      await fetchData();
      return res;
    } catch (err) {
      notify?.("error", errorMessages.post || "Create failed.");
      throw err;
    }
  };

  const patch = async (id, payload) => {
    try {
      const res = await axiosInstance.patch(`/${resourceType}/${id}/`, payload);
      await fetchData();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      const res = await axiosInstance.delete(`/${resourceType}/${id}/`);
      await fetchData();
      return res;
    } catch (err) {
      throw err;
    }
  };

  return { data, loading, error, refetch: fetchData, post, patch, remove };
}

// -------------------------------
// Helpers
// -------------------------------
function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  return [];
}

const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";
const FALLBACK_BANNER_PATH = "/mock/banner-1.png";

function fallbackVideoObject() {
  return {
    id: "fallback-video",
    title: "Fallback Hero Video",
    url: FALLBACK_VIDEO_PATH,
    is_active: true,
    is_featured: true,
  };
}

function fallbackBannerObject() {
  return {
    id: "fallback-banner",
    label: "Fallback Banner",
    type: "image",
    url: { full: FALLBACK_BANNER_PATH, thumb: FALLBACK_BANNER_PATH },
    is_active: true,
    is_featured: true,
  };
}
