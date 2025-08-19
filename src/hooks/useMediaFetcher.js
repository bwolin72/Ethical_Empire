// src/hooks/useMediaFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import API from "../api/api";
import mediaAPI from "../api/mediaAPI";

// Local fallback video path (public folder)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

/**
 * useMediaFetcher
 *
 * - endpointKey: string (e.g., "home", "homeVideos", "featured", ...)
 * - params: optional query params (object) or array of args
 * - options:
 *    - notify?: (type, message) => void         // optional notification function
 *    - successMessages?: { post, put, patch, delete }
 *    - errorMessages?: { post, put, patch, delete }
 *    - transform?: (items) => items             // optional transform on GET results
 *    - resource?: "videos" | "media"            // override resource inference for CRUD
 *    - mutation?: { create, update, patch, remove } // custom mutation endpoints (string|fn)
 *
 * Returns: { data, loading, error, refetch, post, put, patch, remove }
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

  // keep latest data in a ref to enable optimistic updates without re-creating callbacks on every data change
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // mounted guard to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // stable key for params so hooks can depend on a serializable value
  const paramsKey = useMemo(() => safeStableKey(params), [params]);

  // memoized computedParams so we don't reference raw `params` inside callbacks (eslint-friendly)
  const computedParams = useMemo(() => params, [paramsKey]);

  /* ----------------------------
     Resolve GET fetcher for endpointKey
     Returns a function that performs the fetch (returns a Promise)
  -----------------------------*/
  const getFetcher = useCallback(() => {
    if (!endpointKey || typeof endpointKey !== "string") return null;

    // 1) Try mediaAPI methods (getHome, getAbout, getBanners, etc.)
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      // Some mediaAPI methods don't expect params; pass them if present
      return () => mediaAPI[mediaMethodName](computedParams);
    }

    // 2) Try API.videos[endpointKey] (either string URL or function returning URL)
    if (API?.videos && endpointKey in API.videos) {
      const val = API.videos[endpointKey];
      if (typeof val === "function") {
        const url = callWithParams(val, computedParams);
        return () => publicAxios.get(url);
      }
      if (typeof val === "string") {
        return () => publicAxios.get(val, computedParams ? { params: computedParams } : undefined);
      }
    }

    // 3) Try API.media if present (string endpoints)
    if (API?.media && endpointKey in API.media && typeof API.media[endpointKey] === "string") {
      return () => publicAxios.get(API.media[endpointKey], computedParams ? { params: computedParams } : undefined);
    }

    return null;
  }, [endpointKey, paramsKey, computedParams]);

  /* ----------------------------
     Core fetch - handles fallback for videos
  -----------------------------*/
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

      // If video endpoint and empty, show local fallback video
      if (isVideoKey(endpointKey) && items.length === 0) {
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      console.error(`❌ API fetch failed for ${endpointKey}:`, err);
      // for video endpoints, try to degrade gracefully with local fallback
      if (isVideoKey(endpointKey)) {
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
  }, [getFetcher, endpointKey, transform, paramsKey]);

  /* ----------------------------
     Build mutation endpoints (memoized)
  -----------------------------*/
  const mutationKey = useMemo(() => safeStableKey(mutation), [mutation]);
  const endpoints = useMemo(
    () =>
      buildMutationEndpoints({
        endpointKey,
        resourceOverride: resource,
        custom: mutation,
      }),
    // endpointKey, resource and mutationKey drive the endpoints result
    [endpointKey, resource, mutationKey]
  );

  /* ----------------------------
     Optimistic CRUD helpers
  -----------------------------*/
  const resolveCreateUrl = (eps) => {
    if (!eps?.create) throw new Error("[useMediaFetcher] No create endpoint configured.");
    return typeof eps.create === "function" ? eps.create() : eps.create;
  };
  const resolveUpdateUrl = (eps, id) => {
    if (!eps?.update) throw new Error("[useMediaFetcher] No update endpoint configured.");
    return typeof eps.update === "function" ? eps.update(id) : eps.update;
  };
  const resolvePatchUrl = (eps, id) => {
    if (!eps?.patch) throw new Error("[useMediaFetcher] No patch endpoint configured.");
    return typeof eps.patch === "function" ? eps.patch(id) : eps.patch;
  };
  const resolveRemoveUrl = (eps, id) => {
    if (!eps?.remove) throw new Error("[useMediaFetcher] No remove endpoint configured.");
    return typeof eps.remove === "function" ? eps.remove(id) : eps.remove;
  };

  // POST (create) with optimistic add → re-sync on success or rollback on error
  const post = useCallback(
    async (payload, { optimisticItem } = {}) => {
      const prev = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      const tmpId = `tmp-${Date.now()}`;
      const optimistic = { id: tmpId, ...(optimisticItem || payload) };

      if (mountedRef.current) setData((prevArr) => [optimistic, ...prevArr]);

      try {
        const url = resolveCreateUrl(endpoints);
        const res = await axiosInstance.post(url, payload);

        safeNotify(notify, "success", successMessages.post || "Created successfully.");
        // always re-sync to get canonical backend data
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(prev);
        safeNotify(notify, "error", errorMessages.post || "Create failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  // PUT (replace) optimistic
  const put = useCallback(
    async (id, payload) => {
      const prev = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      if (mountedRef.current) {
        setData((prevArr) => prevArr.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      }

      try {
        const url = resolveUpdateUrl(endpoints, id);
        const res = await axiosInstance.put(url, payload);

        safeNotify(notify, "success", successMessages.put || "Updated successfully.");
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(prev);
        safeNotify(notify, "error", errorMessages.put || "Update failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  // PATCH (partial update) optimistic
  const patch = useCallback(
    async (id, payload) => {
      const prev = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      if (mountedRef.current) {
        setData((prevArr) => prevArr.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      }

      try {
        const url = resolvePatchUrl(endpoints, id);
        const res = await axiosInstance.patch(url, payload);

        safeNotify(notify, "success", successMessages.patch || "Saved successfully.");
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(prev);
        safeNotify(notify, "error", errorMessages.patch || "Save failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  // DELETE optimistic
  const remove = useCallback(
    async (id) => {
      const prev = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      if (mountedRef.current) setData((prevArr) => prevArr.filter((it) => it.id !== id));

      try {
        const url = resolveRemoveUrl(endpoints, id);
        await axiosInstance.delete(url);

        safeNotify(notify, "success", successMessages.delete || "Deleted successfully.");
        await fetchData();
      } catch (err) {
        if (mountedRef.current) setData(prev);
        safeNotify(notify, "error", errorMessages.delete || "Delete failed. Item restored.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  // initial fetch and reactive to endpointKey/params changes
  useEffect(() => {
    fetchData();
    // fetchData is memoized
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    post,
    put,
    patch,
    remove,
  };
}

/* ---------------------------
   Helper utilities
   --------------------------- */

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

// call a function that may accept different kinds of params
function callWithParams(fn, params) {
  if (Array.isArray(params)) return fn(...params);
  if (params && typeof params === "object") return fn(...Object.values(params));
  return fn(params);
}

// stable serializer with fallback for circular structures
function safeStableKey(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    // fallback to string
    try {
      return String(value);
    } catch {
      return "unstable";
    }
  }
}

function safeNotify(notify, type, message) {
  if (typeof notify === "function" && message) {
    try {
      notify(type, message);
    } catch (e) {
      // swallow notify errors so hook doesn't crash
      // eslint-disable-next-line no-console
      console.warn("[useMediaFetcher] notify failed:", e);
    }
  }
}

/**
 * Build default mutation endpoints using API config and allow custom overrides.
 * - endpointKey: used to infer resource (videos/media)
 * - resourceOverride: explicit resource (videos|media)
 * - custom: object of overrides { create, update, patch, remove }
 */
function buildMutationEndpoints({ endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(endpointKey);

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
  return null;
}
