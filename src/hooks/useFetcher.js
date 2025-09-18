import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

// Import all API service modules
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

// -------------------------------
// Central API map
// -------------------------------
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

// -------------------------------
// Default fallback endpoint mapping
// -------------------------------
const DEFAULT_ENDPOINT = "list";

// -------------------------------
// useFetcher Hook
// -------------------------------
export default function useFetcher(
  resourceTypeOrEndpoint,
  endpointKeyOrParams,
  paramsOrOptions = {},
  options = {}
) {
  let resourceType, endpointKey, params;

  // Argument parsing
  if (typeof resourceTypeOrEndpoint === "string") {
    resourceType = resourceTypeOrEndpoint;
    endpointKey = endpointKeyOrParams || DEFAULT_ENDPOINT;
    params = paramsOrOptions;
  } else if (
    typeof resourceTypeOrEndpoint === "object" &&
    resourceTypeOrEndpoint.resourceType
  ) {
    resourceType = resourceTypeOrEndpoint.resourceType;
    endpointKey = resourceTypeOrEndpoint.key || DEFAULT_ENDPOINT;
    params = endpointKeyOrParams || {};
    options = paramsOrOptions || {};
  } else {
    throw new Error("[useFetcher] Invalid arguments provided");
  }

  const {
    notify,
    successMessages = {},
    errorMessages = {},
    transform,
    fallback = true,
  } = options;

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch Data
  const fetchData = useCallback(async () => {
    const apiGroup = API_MAP[resourceType];
    if (!apiGroup || typeof apiGroup[endpointKey] !== "function") {
      const msg = `Unknown endpoint: ${resourceType}.${endpointKey}`;
      console.error("[useFetcher]", msg);
      if (mountedRef.current) {
        setError({ message: msg });
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiGroup[endpointKey](params || {});
      let items = extractItems(res);

      // Apply fallbacks for specific resource types
      if (fallback && (!items || items.length === 0)) {
        if (resourceType === "videos") items = [fallbackVideoObject()];
        if (resourceType === "media") items = [fallbackBannerObject()];
      }

      if (mountedRef.current) {
        setData(typeof transform === "function" ? transform(items) : items);
      }
    } catch (err) {
      console.error("[useFetcher] API request failed:", err);

      const normalizedError = {
        message: err.response?.data?.detail || err.message,
        status: err.response?.status || null,
        data: err.response?.data || null,
      };

      if (mountedRef.current) {
        setError(normalizedError);
        setData([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [resourceType, endpointKey, params, transform, fallback]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD Mutations
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

// Fallback data
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
