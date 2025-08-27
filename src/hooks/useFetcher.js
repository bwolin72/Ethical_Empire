// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import mediaAPI from "../api/mediaAPI";
import videoService from "../api/services/videoService";
import endpointMap from "../api/services/endpointMap";
import videosAPI from "../api/videosAPI"; // official videos API

// Local fallback hero video path (served from public/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

export default function useFetcher(resourceType, endpointKey, params = null, options = {}) {
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

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------------------------
  // Resolve GET fetcher
  // -------------------------
  const getFetcher = useCallback(() => {
    // Default fallback if endpointKey missing
    if (!endpointKey || typeof endpointKey !== "string") {
      if (resourceType === "media") return () => publicAxios.get(mediaAPI.defaultList, params ? { params } : undefined);
      if (resourceType === "videos") return () => videoService.list(params);
      return null;
    }

    // MEDIA endpoints
    if (resourceType === "media") {
      const genericKeys = new Set(["media", "defaultList", "all", "default", "list"]);
      if (genericKeys.has(endpointKey)) return () => publicAxios.get(mediaAPI.defaultList, params ? { params } : undefined);

      // If mediaAPI exports helper functions (some setups auto-generate getters),
      // prefer calling them (e.g. mediaAPI.getHome())
      const mediaMethodName = `get${toMethodSuffix(endpointKey)}`;
      if (typeof mediaAPI[mediaMethodName] === "function") {
        return () => mediaAPI[mediaMethodName](params);
      }

      // Build candidate keys and look up endpoints on mediaAPI
      const keyCandidates = uniqueNonEmpty([
        endpointKey,
        applyAliases(endpointKey),
        toCamelCase(endpointKey),
        applyAliases(toCamelCase(endpointKey)),
      ]);

      // admin-only endpoints that require auth (use axiosInstance)
      const adminKeys = new Set(["all", "archived", "stats", "debugProto", "upload", "reorder"]);

      for (const k of keyCandidates) {
        const val = mediaAPI?.[k];
        if (typeof val === "string") {
          const useAuth = adminKeys.has(k);
          return () => (useAuth ? axiosInstance.get(val, params ? { params } : undefined) : publicAxios.get(val, params ? { params } : undefined));
        }

        // if val is a function that returns URL or a promise, call it
        if (typeof val === "function") {
          // assume function returns a promise or URL -> call with params if provided
          return () => val(params);
        }
      }

      // fallback: if endpointKey looks like an absolute path, call it directly
      if (endpointKey.startsWith("/")) {
        return () => publicAxios.get(endpointKey, params ? { params } : undefined);
      }
    }

    // VIDEO endpoints
    if (resourceType === "videos") {
      // If endpointMap exists (maps page keys to endpoint names) use byEndpoint
      if (endpointMap && endpointMap[endpointKey]) {
        return () => videoService.byEndpoint(endpointMap[endpointKey], params);
      }

      // if user passed an endpointKey that matches videosAPI keys, use that
      const videoKeyCandidates = uniqueNonEmpty([
        endpointKey,
        toCamelCase(endpointKey),
        applyAliases(endpointKey),
      ]);
      for (const k of videoKeyCandidates) {
        if (typeof videosAPI[k] === "string") {
          return () => publicAxios.get(videosAPI[k], params ? { params } : undefined);
        }
      }

      // default list
      return () => videoService.list(params);
    }

    return null;
  }, [resourceType, endpointKey, params]);

  // -------------------------
  // Fetch Data
  // -------------------------
  const fetchData = useCallback(async () => {
    const fetcher = getFetcher();
    if (!fetcher) {
      if (mountedRef.current) {
        setError(`Unknown endpoint for ${resourceType}: ${String(endpointKey)}`);
        setLoading(false);
      }
      console.error(`[useFetcher] Unknown endpoint key for ${resourceType}: ${endpointKey}`);
      return;
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetcher();
      const items = extractItems(res);

      // Always provide fallback video if no results
      if (resourceType === "videos" && Array.isArray(items) && items.length === 0) {
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      console.error(`❌ API fetch failed for ${resourceType}:${endpointKey}`, err);
      if (resourceType === "videos") {
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
  }, [getFetcher, resourceType, endpointKey, transform]);

  // -------------------------
  // Build mutation endpoints
  // -------------------------
  const endpoints = useMemo(
    () =>
      buildMutationEndpoints({
        resourceType,
        endpointKey,
        resourceOverride: resource,
        custom: mutation,
      }),
    [resourceType, endpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) =>
    typeof eps.create === "function" ? eps.create() : eps.create;
  const resolveUpdateUrl = (eps, id) =>
    typeof eps.update === "function" ? eps.update(id) : eps.update;
  const resolvePatchUrl = (eps, id) =>
    typeof eps.patch === "function" ? eps.patch(id) : eps.patch;
  const resolveRemoveUrl = (eps, id) =>
    typeof eps.remove === "function" ? eps.remove(id) : eps.remove;

  // -------------------------
  // Optimistic CRUD operations
  // -------------------------
  const post = useCallback(
    async (payload, { optimisticItem } = {}) => {
      const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
      const tmpId = `tmp-${Date.now()}`;
      const optimistic = { id: tmpId, ...(optimisticItem || payload) };
      if (mountedRef.current) setData((prev) => [optimistic, ...prev]);

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

  const patch = useCallback(
    async (id, payload) => {
      try {
        const url = resolvePatchUrl(endpoints, id);
        const res = await axiosInstance.patch(url, payload);
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData]
  );

  const remove = useCallback(
    async (id) => {
      try {
        const url = resolveRemoveUrl(endpoints, id);
        const res = await axiosInstance.delete(url);
        await fetchData();
        return res;
      } catch (err) {
        if (mountedRef.current) setError(err);
        throw err;
      }
    },
    [endpoints, fetchData]
  );

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, post, patch, remove };
}

// ---------------------------
// Helpers
// ---------------------------
function extractItems(res) {
  if (!res) return [];
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return [];
}

function fallbackVideoObject() {
  return {
    id: "fallback-video",
    type: "video",
    title: "Fallback Hero Video",
    video_url: FALLBACK_VIDEO_PATH,
    thumbnail: null,
    is_active: true,
    is_featured: true,
  };
}

function safeNotify(notify, type, message) {
  if (typeof notify === "function" && message) {
    try {
      notify(type, message);
    } catch (e) {
      console.warn("[useFetcher] notify failed:", e);
    }
  }
}

function buildMutationEndpoints({ resourceType, endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(resourceType, endpointKey);
  let defaults = {};

  // Videos: use videosAPI.defaultList and videosAPI.detail(id)
  if (res === "videos") {
    defaults = {
      create: () => videosAPI.defaultList,
      update: (id) => videosAPI.detail(id),
      patch: (id) => videosAPI.detail(id),
      remove: (id) => videosAPI.detail(id),
    };
  } else if (res === "media") {
    // Media may expose strings or functions for endpoints. Support both.
    const createFn = () => (typeof mediaAPI.upload === "function" ? mediaAPI.upload() : mediaAPI.upload);
    const updateFn = (id) =>
      typeof mediaAPI.update === "function" ? mediaAPI.update(id) : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.update)}${id}/update/`;
    const deleteFn = (id) =>
      typeof mediaAPI.delete === "function" ? mediaAPI.delete(id) : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.delete)}${id}/delete/`;
    const restoreFn = (id) =>
      typeof mediaAPI.restore === "function" ? mediaAPI.restore(id) : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.restore)}${id}/restore/`;

    defaults = {
      create: createFn,
      update: updateFn,
      patch: updateFn,
      remove: deleteFn,
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

/* Utility: ensure trailing slash string base for constructing URLs */
function ensureTrailingSlash(str) {
  if (!str || typeof str !== "string") return "/";
  return str.endsWith("/") ? str : `${str}/`;
}

// ---------- Key utils ----------
function toCamelCase(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[-_\s]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function toMethodSuffix(str) {
  if (typeof str !== "string") return "";
  const hasDelim = /[-_\s]/.test(str);
  if (hasDelim) {
    return str
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function uniqueNonEmpty(arr) {
  const seen = new Set();
  return arr.filter((v) => {
    const ok = typeof v === "string" && v.length > 0 && !seen.has(v);
    if (ok) seen.add(v);
    return ok;
  });
}

function applyAliases(key) {
  const aliases = {
    userMedia: "user",
    mediaItems: "all",
    media: "defaultList",
    default: "defaultList",
    list: "defaultList",
    all: "defaultList",
  };
  return aliases[key] || key;
}
