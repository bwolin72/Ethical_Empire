// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

// API modules
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

const DEFAULT_ENDPOINT = "list";

export default function useFetcher(
  resourceTypeOrEndpoint,
  endpointKeyOrParams,
  paramsOrOptions = {},
  options = {}
) {
  let resourceType, endpointKey, params = {}, fetcherFn;

  // ---- Flexible argument parsing ----
  // 1) function: useFetcher(() => apiFn(params), params?, options?)
  if (typeof resourceTypeOrEndpoint === "function") {
    fetcherFn = resourceTypeOrEndpoint;
    params = endpointKeyOrParams || {};
    options = paramsOrOptions || {};
  }
  // 2) dotted single string: "media.about"
  else if (typeof resourceTypeOrEndpoint === "string" && resourceTypeOrEndpoint.includes(".")) {
    const [r, e] = resourceTypeOrEndpoint.split(".");
    resourceType = r;
    endpointKey = e || DEFAULT_ENDPOINT;
    params = endpointKeyOrParams || {};
    options = paramsOrOptions || {};
  }
  // 3) two-arg string form: useFetcher('media','about', params?)
  else if (typeof resourceTypeOrEndpoint === "string") {
    resourceType = resourceTypeOrEndpoint;
    endpointKey = endpointKeyOrParams || DEFAULT_ENDPOINT;
    params = paramsOrOptions || {};
    options = options || {};
  }
  // 4) object forms:
  //    { fetcher: fn, resourceType?: 'media' } or { resourceType: 'media', key: 'about' }
  else if (resourceTypeOrEndpoint && typeof resourceTypeOrEndpoint === "object") {
    if (typeof resourceTypeOrEndpoint.fetcher === "function") {
      fetcherFn = resourceTypeOrEndpoint.fetcher;
      resourceType = resourceTypeOrEndpoint.resourceType; // optional
      params = endpointKeyOrParams || {};
      options = paramsOrOptions || {};
    } else if (resourceTypeOrEndpoint.resourceType) {
      resourceType = resourceTypeOrEndpoint.resourceType;
      endpointKey = resourceTypeOrEndpoint.key || DEFAULT_ENDPOINT;
      params = endpointKeyOrParams || {};
      options = paramsOrOptions || {};
    } else {
      throw new Error("[useFetcher] Invalid arguments provided");
    }
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

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => () => (mountedRef.current = false), []);

  // helper to extract array items from axios/res
  const extractItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.results)) return res.data.results;
    return [];
  };

  const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";
  const FALLBACK_BANNER_PATH = "/mock/banner-1.png";

  const fallbackVideoObject = () => ({
    id: "fallback-video",
    title: "Fallback Hero Video",
    url: FALLBACK_VIDEO_PATH,
    is_active: true,
    is_featured: true,
  });

  const fallbackBannerObject = () => ({
    id: "fallback-banner",
    label: "Fallback Banner",
    type: "image",
    url: { full: FALLBACK_BANNER_PATH, thumb: FALLBACK_BANNER_PATH },
    is_active: true,
    is_featured: true,
  });

  // fetchData: either calls provided fetcherFn or API_MAP[resourceType][endpointKey]
  const fetchData = useCallback(async () => {
    if (!fetcherFn && (!resourceType || !endpointKey)) {
      const msg = "[useFetcher] Missing resourceType/endpoint or fetcher function";
      console.error(msg);
      if (mountedRef.current) {
        setError({ message: msg });
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (fetcherFn) {
        // call provided fetcher function (ensure components pass stable functions where possible)
        res = await fetcherFn(params || {});
      } else {
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
        res = await apiGroup[endpointKey](params || {});
      }

      let items = extractItems(res);

      // apply simple fallbacks only if resourceType is known (or options.resourceType provided)
      const rt = resourceType || options.resourceType;
      if (fallback && (!items || items.length === 0)) {
        if (rt === "videos") items = [fallbackVideoObject()];
        if (rt === "media") items = [fallbackBannerObject()];
      }

      if (mountedRef.current) {
        setData(typeof transform === "function" ? transform(items) : items);
      }
    } catch (err) {
      console.error("[useFetcher] API request failed:", err);
      const normalizedError = {
        message: err?.response?.data?.detail || err?.message,
        status: err?.response?.status || null,
        data: err?.response?.data || null,
      };
      if (mountedRef.current) {
        setError(normalizedError);
        setData([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
    // Note: intentionally not depending on params object's identity here to avoid accidental loops
    // if you want automatic re-fetch on params change, either pass stable params or call refetch manually.
  }, [resourceType, endpointKey, fallback, fetcherFn, transform, options.resourceType]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceType, endpointKey, fallback, fetcherFn]);

  // ---- CRUD helpers (only valid when resourceType is known) ----
  const ensureResource = () => {
    if (!resourceType) throw new Error("[useFetcher] CRUD requires a resourceType string");
  };

  const post = async (payload) => {
    ensureResource();
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
    ensureResource();
    try {
      const res = await axiosInstance.patch(`/${resourceType}/${id}/`, payload);
      await fetchData();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const remove = async (id) => {
    ensureResource();
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
