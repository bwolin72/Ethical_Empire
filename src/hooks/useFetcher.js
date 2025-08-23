// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import mediaAPI from "../api/mediaAPI";
// import videosAPI from "../api/videosAPI"; // (unused) removed to avoid confusion
import videoService from "../api/services/videoService";
import endpointMap from "../api/services/endpointMap";
import API from "../api"; // ✅ for mutation URL building

// Local fallback hero video path (served from public/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

export default function useFetcher(resourceType, endpointKey, params = null, options = {}) {
  const { notify, successMessages = {}, errorMessages = {}, transform, resource, mutation } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // -------------------------
  // Resolve GET fetcher
  // -------------------------
  const getFetcher = useCallback(() => {
    // ✅ Provide sensible defaults if endpointKey is missing
    if (!endpointKey || typeof endpointKey !== "string") {
      if (resourceType === "media") {
        return () => mediaAPI.getDefaultList(); // params usually not needed
      }
      if (resourceType === "videos") {
        return () => videoService.list(params);
      }
      return null;
    }

    if (resourceType === "media") {
      // ✅ Handle generic keys commonly used in code
      const genericKeys = new Set(["media", "defaultList", "all", "default", "list"]);
      if (genericKeys.has(endpointKey)) {
        return () => mediaAPI.getDefaultList(); // ignore params by design
      }

      // Try method like mediaAPI.getHome(), getLiveBand(), etc.
      const methodSuffix = toMethodSuffix(endpointKey);
      const mediaMethodName = `get${methodSuffix}`;
      if (typeof mediaAPI[mediaMethodName] === "function") {
        return () => mediaAPI[mediaMethodName](params);
      }

      // Try raw endpoints lookup (e.g., 'liveBand', 'home', etc.)
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
      // If it maps to a known endpoint key, use the service's helper
      if (endpointMap && endpointMap[endpointKey]) {
        return () => videoService.byEndpoint(endpointKey, params);
      }
      // Otherwise, generic list with filters (e.g., endpoint=..., is_active=true)
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
      if (mountedRef.current) { setError(`Unknown endpoint for ${resourceType}: ${String(endpointKey)}`); setLoading(false); }
      console.error(`[useFetcher] Unknown endpoint key for ${resourceType}: ${endpointKey}`);
      return;
    }

    if (mountedRef.current) { setLoading(true); setError(null); }

    try {
      const res = await fetcher();
      const items = extractItems(res);

      // ✅ Always give the UI something playable for videos
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

  // -------------------------
  // Build mutation endpoints
  // -------------------------
  const endpoints = useMemo(
    () => buildMutationEndpoints({
      resourceType,
      endpointKey,
      resourceOverride: resource,
      custom: mutation
    }),
    [resourceType, endpointKey, resource, mutation]
  );

  const resolveCreateUrl = eps => (typeof eps.create === "function" ? eps.create() : eps.create);
  const resolveUpdateUrl = (eps, id) => (typeof eps.update === "function" ? eps.update(id) : eps.update);
  const resolvePatchUrl = (eps, id) => (typeof eps.patch === "function" ? eps.patch(id) : eps.patch);
  const resolveRemoveUrl = (eps, id) => (typeof eps.remove === "function" ? eps.remove(id) : eps.remove);

  // -------------------------
  // Optimistic CRUD operations
  // -------------------------
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

  const patch = useCallback(async (id, payload) => {
    try {
      const url = resolvePatchUrl(endpoints, id);
      const res = await axiosInstance.patch(url, payload);
      await fetchData();
      return res;
    } catch (err) {
      if (mountedRef.current) setError(err);
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
      if (mountedRef.current) setError(err);
      throw err;
    }
  }, [endpoints, fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    try { notify(type, message); } catch (e) { console.warn("[useFetcher] notify failed:", e); }
  }
}

function buildMutationEndpoints({ resourceType, endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(resourceType, endpointKey);
  let defaults = {};

  if (res === "videos") {
    // ✅ Use API.videos URLs instead of endpointMap.*Video (those may not exist)
    defaults = {
      create: () => API.videos.list,            // POST to collection
      update: (id) => API.videos.detail(id),    // PUT
      patch:  (id) => API.videos.detail(id),    // PATCH
      remove: (id) => API.videos.detail(id),    // DELETE
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

function inferResource(resourceType /*, endpointKey */) {
  if (resourceType === "videos") return "videos";
  if (resourceType === "media") return "media";
  return null;
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
  const aliases = {
    userMedia: "user",
    mediaItems: "all",
    media: "defaultList",   // ✅ new: map "media" → defaultList
    default: "defaultList",
    list: "defaultList",
    all: "defaultList",
  };
  return aliases[key] || key;
}
