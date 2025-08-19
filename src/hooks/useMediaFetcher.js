// src/hooks/useMediaFetcher.js
import { useState, useEffect, useCallback, useRef } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import API from "../api/api";
import mediaAPI from "../api/mediaAPI";

// 🔒 Path to fallback hero video (ensure it exists in /public/mock/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

/**
 * useMediaFetcher
 * - endpointKey: string (e.g., "home", "homeVideos", "featured", etc.)
 * - params: query params or args for GET (optional)
 * - options:
 *    - notify?: (type: "success" | "error" | "info" | "warning", message: string) => void
 *    - successMessages?: { post?, put?, patch?, delete? }
 *    - errorMessages?: { post?, put?, patch?, delete? }
 *    - transform?: (items) => items   // post-process list
 *    - resource?: "videos" | "media"  // override resource for mutations
 *    - mutation?: {                   // custom endpoints for CRUD (overrides defaults)
 *         create?: string | (payload) => string
 *         update?: (id) => string
 *         patch?: (id) => string
 *         remove?: (id) => string
 *      }
 */
export default function useMediaFetcher(endpointKey, params = null, options = {}) {
  const {
    notify,
    successMessages = {},
    errorMessages = {},
    transform,
    resource,
    mutation,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // stable string for params deps
  const paramsKey = safeStableKey(params);

  /* -----------------------------------
     Resolve GET fetcher for the key
  ------------------------------------ */
  const getFetcher = useCallback(() => {
    // 1) mediaAPI.* style, e.g. getHome, getAbout, etc.
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      return () => mediaAPI[mediaMethodName](params);
    }

    // 2) API.videos.* can be a function (detail) or URL (list)
    if (API?.videos && endpointKey in API.videos) {
      const val = API.videos[endpointKey];
      if (typeof val === "function") {
        // if function returns URL
        const url = callWithParams(val, params);
        return () => publicAxios.get(url);
      }
      if (typeof val === "string") {
        return () => publicAxios.get(val, params ? { params } : undefined);
      }
    }

    // 3) Fallback: try API.media.* lists if key matches a known list
    if (API?.media && endpointKey in API.media && typeof API.media[endpointKey] === "string") {
      return () => publicAxios.get(API.media[endpointKey], params ? { params } : undefined);
    }

    return null;
  }, [endpointKey, paramsKey]);

  /* -----------------------------------
     Core fetch (with video fallback)
  ------------------------------------ */
  const fetchData = useCallback(async () => {
    const fetcher = getFetcher();
    if (!fetcher) {
      console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
      if (mountedRef.current) {
        setError(`Unknown endpoint: ${endpointKey}`);
        setLoading(false);
      }
      return;
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetcher();
      const items = extractItems(res);

      // Fallback for video endpoints
      if (isVideoKey(endpointKey) && items.length === 0) {
        console.warn(`[useMediaFetcher] No videos for "${endpointKey}", using fallback.`);
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      console.error(`❌ API fetch failed for ${endpointKey}:`, err);
      if (isVideoKey(endpointKey)) {
        // non-blocking fallback for videos
        if (mountedRef.current) {
          setData([fallbackVideoObject()]);
          setError(null);
        }
      } else {
        if (mountedRef.current) {
          setData([]);
          setError(err);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [endpointKey, paramsKey, getFetcher, transform]);

  /* -----------------------------------
     Mutation endpoints (defaults + override)
  ------------------------------------ */
  const endpoints = buildMutationEndpoints({
    endpointKey,
    resourceOverride: resource,
    custom: mutation,
  });

  /* -----------------------------------
     CRUD with optimistic updates
  ------------------------------------ */
  const post = useCallback(
    async (payload, { optimisticItem } = {}) => {
      // Optimistic: add temp item to the list
      const previous = mountedRef.current ? [...data] : [];
      const tmpId = `tmp-${Date.now()}`;
      const optimistic = { id: tmpId, ...(optimisticItem || payload) };

      if (mountedRef.current) setData((prev) => [optimistic, ...prev]);

      try {
        const url = resolveCreateUrl(endpoints);
        const res = await axiosInstance.post(url, payload);
        // Success toast
        safeNotify(
          notify,
          "success",
          successMessages.post || "Created successfully."
        );
        // Re-sync with backend
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(previous); // rollback
        safeNotify(
          notify,
          "error",
          errorMessages.post || "Create failed. Changes reverted."
        );
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [data, endpoints, fetchData, notify, successMessages.post, errorMessages.post]
  );

  const put = useCallback(
    async (id, payload) => {
      const previous = mountedRef.current ? [...data] : [];
      if (mountedRef.current) {
        setData((prev) => prev.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      }

      try {
        const url = resolveUpdateUrl(endpoints, id);
        const res = await axiosInstance.put(url, payload);
        safeNotify(
          notify,
          "success",
          successMessages.put || "Updated successfully."
        );
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(previous); // rollback
        safeNotify(
          notify,
          "error",
          errorMessages.put || "Update failed. Changes reverted."
        );
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [data, endpoints, fetchData, notify, successMessages.put, errorMessages.put]
  );

  const patch = useCallback(
    async (id, payload) => {
      const previous = mountedRef.current ? [...data] : [];
      if (mountedRef.current) {
        setData((prev) => prev.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      }

      try {
        const url = resolvePatchUrl(endpoints, id);
        const res = await axiosInstance.patch(url, payload);
        safeNotify(
          notify,
          "success",
          successMessages.patch || "Saved successfully."
        );
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(previous); // rollback
        safeNotify(
          notify,
          "error",
          errorMessages.patch || "Save failed. Changes reverted."
        );
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [data, endpoints, fetchData, notify, successMessages.patch, errorMessages.patch]
  );

  const remove = useCallback(
    async (id) => {
      const previous = mountedRef.current ? [...data] : [];
      if (mountedRef.current) {
        setData((prev) => prev.filter((it) => it.id !== id));
      }

      try {
        const url = resolveRemoveUrl(endpoints, id);
        await axiosInstance.delete(url);
        safeNotify(
          notify,
          "success",
          successMessages.delete || "Deleted successfully."
        );
        await fetchData();
      } catch (err) {
        if (mountedRef.current) setData(previous); // rollback
        safeNotify(
          notify,
          "error",
          errorMessages.delete || "Delete failed. Item restored."
        );
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [data, endpoints, fetchData, notify, successMessages.delete, errorMessages.delete]
  );

  // initial + reactive fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    // optimistic mutations
    post,
    put,
    patch,
    remove,
  };
}

/* ---------------------------
   Helpers
---------------------------- */

function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return [];
}

function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isVideoKey(key) {
  return typeof key === "string" && key.toLowerCase().includes("video");
}

function fallbackVideoObject() {
  return {
    id: "fallback-video",
    type: "video",
    title: "Fallback Hero Video",
    src: FALLBACK_VIDEO_PATH,
    thumbnail: null,
    is_active: true,
    is_featured: true,
  };
}

// call a function with params that may be object/array/primitive
function callWithParams(fn, params) {
  if (Array.isArray(params)) return fn(...params);
  if (params && typeof params === "object") return fn(...Object.values(params));
  return fn(params);
}

function safeStableKey(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return String(value ?? "");
  }
}

function safeNotify(notify, type, message) {
  if (typeof notify === "function" && message) {
    notify(type, message);
  }
}

/**
 * Determine default mutation endpoints based on endpointKey or resource override,
 * then apply any custom overrides from options.mutation.
 */
function buildMutationEndpoints({ endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(endpointKey); // "videos" | "media" | null

  let defaults = {};
  if (res === "videos") {
    defaults = {
      create: API?.videos?.list,
      update: (id) => API?.videos?.detail?.(id),
      patch: (id) => API?.videos?.detail?.(id),
      remove: (id) => API?.videos?.detail?.(id),
    };
  } else if (res === "media") {
    defaults = {
      create: API?.media?.upload,
      update: (id) => API?.media?.update?.(id),
      patch: (id) => API?.media?.update?.(id),
      remove: (id) => API?.media?.delete?.(id),
    };
  }

  // merge custom overrides
  return {
    create: custom?.create || defaults.create,
    update: custom?.update || defaults.update,
    patch: custom?.patch || defaults.patch,
    remove: custom?.remove || defaults.remove,
  };
}

function inferResource(endpointKey) {
  const key = (endpointKey || "").toLowerCase();
  if (key.includes("video")) return "videos";
  if (key.includes("media") || key === "home" || key === "featured" || key === "banners") return "media";
  return null; // unknown → must pass options.mutation for CRUD
}

function resolveCreateUrl(endpoints) {
  if (!endpoints?.create) {
    throw new Error("[useMediaFetcher] No create endpoint configured.");
  }
  return typeof endpoints.create === "function" ? endpoints.create() : endpoints.create;
}
function resolveUpdateUrl(endpoints, id) {
  if (!endpoints?.update) {
    throw new Error("[useMediaFetcher] No update endpoint configured.");
  }
  return typeof endpoints.update === "function" ? endpoints.update(id) : endpoints.update;
}
function resolvePatchUrl(endpoints, id) {
  if (!endpoints?.patch) {
    throw new Error("[useMediaFetcher] No patch endpoint configured.");
  }
  return typeof endpoints.patch === "function" ? endpoints.patch(id) : endpoints.patch;
}
function resolveRemoveUrl(endpoints, id) {
  if (!endpoints?.remove) {
    throw new Error("[useMediaFetcher] No remove endpoint configured.");
  }
  return typeof endpoints.remove === "function" ? endpoints.remove(id) : endpoints.remove;
}
