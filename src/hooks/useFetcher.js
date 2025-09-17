import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";     // no-auth axios
import axiosInstance from "../api/axiosInstance"; // auth-required axios

/**
 * Generic data fetching & CRUD hook
 * Compatible with:
 *   • /api/videos/ (DRF router)
 *   • /api/media/… (custom endpoints)
 */
export default function useFetcher(resourceType, endpointKey, params = null, options = {}) {
  const {
    notify,
    successMessages = {},
    errorMessages = {},
    transform,
    resource,
    mutation,
    fallback = true,
  } = options;

  // --- stable memoised params so useEffect deps don't thrash ---
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const stableEndpointKey = useMemo(() => endpointKey, [endpointKey]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // ------------------------------------------------------------------
  // Build GET fetcher for each resource type and endpoint
  // ------------------------------------------------------------------
  const getFetcher = useCallback(() => {
    const fetchUrl = (urlOrFn) => (typeof urlOrFn === "function" ? urlOrFn() : urlOrFn);

    if (resourceType === "videos") {
      // DRF router already exposes list/detail at /videos/
      if (!stableEndpointKey || stableEndpointKey === "list") {
        return () => publicAxios.get("/videos/", stableParams ? { params: stableParams } : undefined);
      }
      if (stableEndpointKey === "detail") {
        if (!stableParams?.id) throw new Error("Missing id for video detail");
        return () => publicAxios.get(`/videos/${stableParams.id}/`);
      }
    }

    if (resourceType === "media") {
      /**
       * Map the endpointKey to the actual Django URLs from urls.py
       * Only include the public-facing ones; admin endpoints should use auth.
       */
      const mediaPaths = {
        list: "", // default list
        banners: "banners/",
        featured: "featured/",
        vendor: "vendor/",
        partner: "partner/",
        user: "user/",
        home: "home/",
        about: "about/",
        decor: "decor/",
        "live-band": "live-band/",
        catering: "catering/",
        "media-hosting": "media-hosting/",
        "partner-vendor-dashboard": "partner-vendor-dashboard/",
      };

      const key = stableEndpointKey || "list";
      const path = mediaPaths[key];
      if (path === undefined) {
        throw new Error(`Unknown media endpoint key: ${key}`);
      }
      return () =>
        publicAxios.get(`/media/${path}`, stableParams ? { params: stableParams } : undefined);
    }

    return null;
  }, [resourceType, stableEndpointKey, stableParams]);

  // ------------------------------------------------------------------
  // Fetch the data
  // ------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    const fetcher = getFetcher();
    if (!fetcher) {
      if (mountedRef.current) {
        setError({ message: `Unknown endpoint for ${resourceType}: ${String(stableEndpointKey)}` });
        setLoading(false);
      }
      console.error(`[useFetcher] Unknown endpoint key for ${resourceType}: ${stableEndpointKey}`);
      return;
    }

    if (mountedRef.current) { setLoading(true); setError(null); }

    try {
      const res = await fetcher();
      let items = extractItems(res);

      // --- fallback hero or banner if nothing returned ---
      if (fallback) {
        if (resourceType === "videos" && (!items || items.length === 0)) {
          mountedRef.current && setData([fallbackVideoObject()]);
          return;
        }
        if (resourceType === "media" && (!items || items.length === 0)) {
          mountedRef.current && setData([fallbackBannerObject()]);
          return;
        }
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      mountedRef.current && setData(finalItems);
    } catch (err) {
      const normalizedError = {
        message: err.response?.data?.detail || err.message,
        status: err.response?.status || null,
        data: err.response?.data || null,
      };
      console.error(`❌ API fetch failed for ${resourceType}:${stableEndpointKey}`, normalizedError);

      if (fallback) {
        if (resourceType === "videos") {
          mountedRef.current && setData([fallbackVideoObject()]);
          setError(null);
          return;
        }
        if (resourceType === "media") {
          mountedRef.current && setData([fallbackBannerObject()]);
          setError(null);
          return;
        }
      }

      mountedRef.current && setData([]);
      mountedRef.current && setError(normalizedError);
    } finally {
      mountedRef.current && setLoading(false);
    }
  }, [getFetcher, resourceType, stableEndpointKey, transform, fallback]);

  // ------------------------------------------------------------------
  // CRUD mutation endpoints (admin/auth only)
  // ------------------------------------------------------------------
  const endpoints = useMemo(
    () => buildMutationEndpoints({
      resourceType,
      endpointKey: stableEndpointKey,
      resourceOverride: resource,
      custom: mutation
    }),
    [resourceType, stableEndpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) => typeof eps.create === "function" ? eps.create() : eps.create;
  const resolvePatchUrl = (eps, id) => typeof eps.patch === "function" ? eps.patch(id) : eps.patch;
  const resolveRemoveUrl = (eps, id) => typeof eps.remove === "function" ? eps.remove(id) : eps.remove;

  const post = useCallback(async (payload, { optimisticItem } = {}) => {
    const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
    const tmpId = `tmp-${Date.now()}`;
    const optimistic = { id: tmpId, ...(optimisticItem || payload) };
    mountedRef.current && setData(prev => [optimistic, ...prev]);

    try {
      const url = resolveCreateUrl(endpoints);
      const res = await axiosInstance.post(url, payload);
      safeNotify(notify, "success", successMessages.post || "Created successfully.");
      await fetchData();
      return res;
    } catch (err) {
      mountedRef.current && setData(previous);
      safeNotify(notify, "error", errorMessages.post || "Create failed. Changes reverted.");
      mountedRef.current && setError(err);
      throw err;
    }
  }, [endpoints, fetchData, notify, successMessages, errorMessages]);

  const patch = useCallback(async (id, payload) => {
    try {
      const url = resolvePatchUrl(endpoints, id);
      const res = await axiosInstance.patch(url, payload);
      await fetchData();
      return res;
    } catch (err) {
      mountedRef.current && setError(err);
      throw err;
    }
  }, [endpoints, fetchData]);

  const remove = useCallback(async (id) => {
    try {
      const url = resolveRemoveUrl(endpoints, id);
      const res = await axiosInstance.delete(url);
      await fetchData();
      return res;
    } catch (err) {
      mountedRef.current && setError(err);
      throw err;
    }
  }, [endpoints, fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData, post, patch, remove };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return [];
}

const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";
const FALLBACK_BANNER_PATH = "/mock/banner-1.png";

function fallbackVideoObject() {
  return {
    id: "fallback-video",
    title: "Fallback Hero Video",
    video_url: FALLBACK_VIDEO_PATH,
    thumbnail_url: null,
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

function safeNotify(notify, type, message) {
  if (typeof notify === "function" && message) {
    try { notify(type, message); } catch (e) { console.warn("[useFetcher] notify failed:", e); }
  }
}

function buildMutationEndpoints({ resourceType, endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(resourceType);
  let defaults = {};

  if (res === "videos") {
    defaults = {
      create: () => "/videos/",
      update: (id) => `/videos/${id}/`,
      patch: (id) => `/videos/${id}/`,
      remove: (id) => `/videos/${id}/`,
    };
  } else if (res === "media") {
    defaults = {
      create: () => "/media/upload/",
      update: (id) => `/media/${id}/update/`,
      patch: (id) => `/media/${id}/update/`,
      remove: (id) => `/media/${id}/delete/`,
    };
  }

  return {
    create: custom?.create || defaults.create,
    update: custom?.update || defaults.update,
    patch: custom?.patch || defaults.patch,
    remove: custom?.remove || defaults.remove,
  };
}

function inferResource(resourceType) {
  if (resourceType === "videos") return "videos";
  if (resourceType === "media") return "media";
  return null;
}
