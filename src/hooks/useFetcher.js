// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import mediaAPI from "../api/mediaAPI";
import videoService from "../api/services/videoService";
import endpointMap from "../api/endpointMap"; // centralised map

// Local fallback hero video path (served from public/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

/**
 * useFetcher
 *
 * Generic hook for fetching & mutating media or videos
 *
 * @param {string} resourceType - "media" | "videos"
 * @param {string} endpointKey  - key like "home", "decor", "user"
 * @param {object} options      - same as before (notify, transform, etc.)
 */
export default function useFetcher(resourceType, endpointKey, params = null, options = {}) {
  const { notify, successMessages = {}, errorMessages = {}, transform, resource, mutation } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  /* -------------------------
     Resolve GET fetcher for endpointKey
  ------------------------- */
  const getFetcher = useCallback(() => {
    if (!endpointKey || typeof endpointKey !== "string") return null;

    // Decide based on resourceType
    if (resourceType === "media") {
      // 1) Direct method match (e.g. getHomeMedia)
      const methodSuffix = toMethodSuffix(endpointKey);
      const mediaMethodName = `get${methodSuffix}`;
      if (typeof mediaAPI[mediaMethodName] === "function") {
        return () => mediaAPI[mediaMethodName](params);
      }

      // 2) Endpoint map lookup
      const keyCandidates = uniqueNonEmpty([
        endpointKey,
        applyAliases(endpointKey),
        toCamelCase(endpointKey),
        applyAliases(toCamelCase(endpointKey)),
      ]);

      for (const k of keyCandidates) {
        const val = mediaAPI?.endpoints?.[k];
        if (typeof val === "string") {
          return () => publicAxios.get(val, params ? { params } : undefined);
        }
      }
    }

    if (resourceType === "videos") {
      // Use videoService dynamic fetcher via endpointMap
      if (endpointMap[endpointKey]) {
        return () => videoService.byEndpoint(endpointKey, params);
      }
      // fallback to list
      return () => videoService.list(params);
    }

    return null;
  }, [resourceType, endpointKey, params]);

  /* -------------------------
     Core fetch with fallback
  ------------------------- */
  const fetchData = useCallback(async () => {
    const fetcher = getFetcher();
    if (!fetcher) {
      if (mountedRef.current) { setError(`Unknown endpoint: ${endpointKey}`); setLoading(false); }
      console.error(`[useFetcher] Unknown endpoint key: ${endpointKey}`);
      return;
    }

    if (mountedRef.current) { setLoading(true); setError(null); }

    try {
      const res = await fetcher();
      const items = extractItems(res);

      if (resourceType === "videos" && Array.isArray(items) && items.length === 0) {
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      console.error(`❌ API fetch failed for ${resourceType}:${endpointKey}`, err);
      if (resourceType === "videos") {
        if (mountedRef.current) { setData([fallbackVideoObject()]); setError(null); }
      } else {
        if (mountedRef.current) { setData([]); setError(err); }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [getFetcher, resourceType, endpointKey, transform]);

  /* -------------------------
     Build mutation endpoints
  ------------------------- */
  const endpoints = useMemo(
    () => buildMutationEndpoints({ resourceType, endpointKey, resourceOverride: resource, custom: mutation }),
    [resourceType, endpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) => (typeof eps.create === "function" ? eps.create() : eps.create);
  const resolveUpdateUrl = (eps, id) => (typeof eps.update === "function" ? eps.update(id) : eps.update);
  const resolvePatchUrl = (eps, id) => (typeof eps.patch === "function" ? eps.patch(id) : eps.patch);
  const resolveRemoveUrl = (eps, id) => (typeof eps.remove === "function" ? eps.remove(id) : eps.remove);

  /* -------------------------
     Optimistic CRUD operations
  ------------------------- */
  const post = useCallback(async (payload, { optimisticItem } = {}) => {
    const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
    const tmpId = `tmp-${Date.now()}`;
    const optimistic = { id: tmpId, ...(optimisticItem || payload) };
    if (mountedRef.current) setData(prev => [optimistic, ...prev]);

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
  }, [endpoints, fetchData, notify, successMessages, errorMessages]);

  // put, patch, remove are the same as your current code — omitted for brevity
  // just reuse them with `endpoints` and `fetchData`

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData, post /*, put, patch, remove */ };
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
    try { notify(type, message); } catch (e) { console.warn("[useFetcher] notify failed:", e); }
  }
}

/**
 * Build CRUD endpoints map for axiosInstance mutations
 */
function buildMutationEndpoints({ resourceType, endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(resourceType, endpointKey);
  let defaults = {};

  if (res === "videos") {
    defaults = {
      create: endpointMap.createVideo,
      update: (id) => endpointMap.updateVideo(id),
      patch:  (id) => endpointMap.updateVideo(id),
      remove: (id) => endpointMap.deleteVideo(id),
    };
  } else if (res === "media") {
    defaults = {
      create: mediaAPI?.endpoints?.upload,
      update: (id) => mediaAPI?.endpoints?.update?.(id),
      patch:  (id) => mediaAPI?.endpoints?.update?.(id),
      remove: (id) => mediaAPI?.endpoints?.delete?.(id),
    };
  }

  return {
    create: custom?.create || defaults.create,
    update: custom?.update || defaults.update,
    patch:  custom?.patch  || defaults.patch,
    remove: custom?.remove || defaults.remove,
  };
}

function inferResource(resourceType, endpointKey) {
  if (resourceType === "videos") return "videos";
  if (resourceType === "media") return "media";
  return null;
}

/* ---------- key normalization utils ---------- */
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
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function uniqueNonEmpty(arr) {
  const seen = new Set();
  return arr.filter(v => {
    const ok = typeof v === "string" && v.length > 0 && !seen.has(v);
    if (ok) seen.add(v);
    return ok;
  });
}
function applyAliases(key) {
  const aliases = { userMedia: "user", mediaItems: "all" };
  return aliases[key] || key;
}
