// src/hooks/useMediaFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import API from "../api/api";
import mediaAPI from "../api/mediaAPI";

// Local fallback hero video path (served from public/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

/**
 * useMediaFetcher
 *
 * Provides:
 *  - GET fetch for a flexible "endpointKey" (mediaAPI, API.videos, API.media)
 *  - optimistic CRUD: post, put, patch, remove (uses axiosInstance)
 *  - auto re-sync (refetch) after mutations
 *  - graceful fallback for video endpoints (local fallback video object)
 *
 * Signature:
 *   useMediaFetcher(endpointKey, params = null, options = {})
 *
 * options:
 *   notify?: (type, message) => void
 *   successMessages?: { post, put, patch, delete }
 *   errorMessages?: { post, put, patch, delete }
 *   transform?: (items) => items
 *   resource?: "videos" | "media"
 *   mutation?: { create, update, patch, remove } // custom endpoints (string or fn)
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

  // keep latest data in a ref for rollback (optimistic updates)
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // mounted guard to avoid setting state after unmount
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* -------------------------
     Resolve GET fetcher for endpointKey
     returns: () => Promise<Response>
     ------------------------- */
  const getFetcher = useCallback(() => {
    if (!endpointKey || typeof endpointKey !== "string") return null;

    // 1) mediaAPI methods like getHome, getAbout, getBanners
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      return () => mediaAPI[mediaMethodName](params);
    }

    // 2) API.videos.* entries
    if (API?.videos && Object.prototype.hasOwnProperty.call(API.videos, endpointKey)) {
      const val = API.videos[endpointKey];
      if (typeof val === "function") {
        const url = callWithParams(val, params);
        return () => publicAxios.get(url);
      }
      if (typeof val === "string") {
        return () => publicAxios.get(val, params ? { params } : undefined);
      }
    }

    // 3) API.media.* entries (string endpoints)
    if (API?.media && Object.prototype.hasOwnProperty.call(API.media, endpointKey)) {
      const val = API.media[endpointKey];
      if (typeof val === "string") {
        return () => publicAxios.get(val, params ? { params } : undefined);
      }
    }

    return null;
  }, [endpointKey, params]);

  /* -------------------------
     fetchData: core GET with fallback for video endpoints
     ------------------------- */
  const fetchData = useCallback(
    async (opts = {}) => {
      const fetcher = getFetcher();
      if (!fetcher) {
        if (mountedRef.current) {
          setError(`Unknown endpoint: ${endpointKey}`);
          setLoading(false);
        }
        console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
        return;
      }

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetcher(opts);
        const items = extractItems(res);

        // Fallback for empty video lists
        if (isVideoKey(endpointKey) && Array.isArray(items) && items.length === 0) {
          if (mountedRef.current) setData([fallbackVideoObject()]);
          return;
        }

        const finalItems = typeof transform === "function" ? transform(items) : items;
        if (mountedRef.current) setData(finalItems);
      } catch (err) {
        console.error(`❌ API fetch failed for ${endpointKey}:`, err);
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
    },
    [getFetcher, endpointKey, transform]
  );

  /* -------------------------
     Build mutation endpoints
     ------------------------- */
  const endpoints = useMemo(
    () =>
      buildMutationEndpoints({
        endpointKey,
        resourceOverride: resource,
        custom: mutation,
      }),
    [endpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) => (typeof eps.create === "function" ? eps.create() : eps.create);
  const resolveUpdateUrl = (eps, id) =>
    typeof eps.update === "function" ? eps.update(id) : eps.update;
  const resolvePatchUrl = (eps, id) =>
    typeof eps.patch === "function" ? eps.patch(id) : eps.patch;
  const resolveRemoveUrl = (eps, id) =>
    typeof eps.remove === "function" ? eps.remove(id) : eps.remove;

  /* -------------------------
     Optimistic CRUD operations
     ------------------------- */
  const post = useCallback(
    async (payload, { optimisticItem } = {}) => {
      const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      const tmpId = `tmp-${Date.now()}`;
      const optimistic = { id: tmpId, ...(optimisticItem || payload) };

      if (mountedRef.current) setData((prevArr) => [optimistic, ...prevArr]);

      try {
        const url = resolveCreateUrl(endpoints);
        const res = await axiosInstance.post(url, payload);
        safeNotify(notify, "success", successMessages.post || "Created successfully.");
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(previous);
        safeNotify(notify, "error", errorMessages.post || "Create failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  const put = useCallback(
    async (id, payload) => {
      const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
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
        if (mountedRef.current) setData(previous);
        safeNotify(notify, "error", errorMessages.put || "Update failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  const patch = useCallback(
    async (id, payload) => {
      const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
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
        if (mountedRef.current) setData(previous);
        safeNotify(notify, "error", errorMessages.patch || "Save failed. Changes reverted.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  const remove = useCallback(
    async (id) => {
      const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      if (mountedRef.current) setData((prevArr) => prevArr.filter((it) => it.id !== id));

      try {
        const url = resolveRemoveUrl(endpoints, id);
        const res = await axiosInstance.delete(url);
        safeNotify(notify, "success", successMessages.delete || "Deleted successfully.");
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setData(previous);
        safeNotify(notify, "error", errorMessages.delete || "Delete failed. Item restored.");
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData, notify, successMessages, errorMessages]
  );

  // initial fetch
  useEffect(() => {
    fetchData();
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
   Helpers
   --------------------------- */
function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return [];
}

function capitalize(str) {
  return typeof str === "string" && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";
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

function callWithParams(fn, params) {
  if (Array.isArray(params)) return fn(...params);
  if (params && typeof params === "object") return fn(...Object.values(params));
  return fn(params);
}

function safeNotify(notify, type, message) {
  if (typeof notify === "function" && message) {
    try {
      notify(type, message);
    } catch (e) {
      console.warn("[useMediaFetcher] notify failed:", e);
    }
  }
}

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
  if (key.includes("media") || ["home", "featured", "banners"].includes(key)) return "media";
  return null;
}
