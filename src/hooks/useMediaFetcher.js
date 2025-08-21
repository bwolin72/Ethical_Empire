// src/hooks/useMediaFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import mediaAPI from "../api/mediaAPI";

// Local fallback hero video path (served from public/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

/**
 * useMediaFetcher
 *
 * Provides:
 *  - GET fetch for a flexible "endpointKey" (via mediaAPI methods or mediaAPI.endpoints)
 *  - optimistic CRUD: post, put, patch, remove (uses axiosInstance)
 *  - auto re-sync (refetch) after mutations
 *  - graceful fallback for video endpoints (local fallback video object)
 */
export default function useMediaFetcher(endpointKey, params = null, options = {}) {
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

    // 1) Try mediaAPI getter method: getHome, getFeatured, getUser, getLiveBand, getMediaHosting, etc.
    const methodSuffix = toMethodSuffix(endpointKey); // PascalCase
    const mediaMethodName = `get${methodSuffix}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      return () => mediaAPI[mediaMethodName](params);
    }

    // 2) Try mediaAPI.endpoints by key, supporting aliases and kebab_case -> camelCase
    const keyCandidates = uniqueNonEmpty([
      endpointKey,
      applyAliases(endpointKey),              // userMedia -> user, mediaItems -> all
      toCamelCase(endpointKey),               // live-band -> liveBand
      applyAliases(toCamelCase(endpointKey)), // safety with aliases after camelizing
    ]);

    for (const k of keyCandidates) {
      const val = mediaAPI?.endpoints?.[k];
      if (typeof val === "string") {
        return () => publicAxios.get(val, params ? { params } : undefined);
      }
    }

    return null;
  }, [endpointKey, params]);

  /* -------------------------
     Core fetch with fallback
  ------------------------- */
  const fetchData = useCallback(async () => {
    const fetcher = getFetcher();
    if (!fetcher) {
      if (mountedRef.current) { setError(`Unknown endpoint: ${endpointKey}`); setLoading(false); }
      console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
      return;
    }

    if (mountedRef.current) { setLoading(true); setError(null); }

    try {
      const res = await fetcher();
      const items = extractItems(res);

      if (isVideoKey(endpointKey) && Array.isArray(items) && items.length === 0) {
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      console.error(`❌ API fetch failed for ${endpointKey}:`, err);
      if (isVideoKey(endpointKey)) {
        if (mountedRef.current) { setData([fallbackVideoObject()]); setError(null); }
      } else {
        if (mountedRef.current) { setData([]); setError(err); }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [getFetcher, endpointKey, transform]);

  /* -------------------------
     Build mutation endpoints
  ------------------------- */
  const endpoints = useMemo(
    () => buildMutationEndpoints({ endpointKey, resourceOverride: resource, custom: mutation }),
    [endpointKey, resource, mutation]
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

  const put = useCallback(async (id, payload) => {
    const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
    if (mountedRef.current) setData(prev => prev.map(it => it.id === id ? { ...it, ...payload } : it));

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
  }, [endpoints, fetchData, notify, successMessages, errorMessages]);

  const patch = useCallback(async (id, payload) => {
    const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
    if (mountedRef.current) setData(prev => prev.map(it => it.id === id ? { ...it, ...payload } : it));

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
  }, [endpoints, fetchData, notify, successMessages, errorMessages]);

  const remove = useCallback(async (id) => {
    const previous = Array.isArray(dataRef.current) ? [...dataRef.current] : [];
    if (mountedRef.current) setData(prev => prev.filter(it => it.id !== id));

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
  }, [endpoints, fetchData, notify, successMessages, errorMessages]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData, post, put, patch, remove };
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
    try { notify(type, message); } catch (e) { console.warn("[useMediaFetcher] notify failed:", e); }
  }
}

/**
 * Build CRUD endpoints map for axiosInstance mutations
 * Uses mediaAPI.endpoints (aligned with Django urls.py)
 */
function buildMutationEndpoints({ endpointKey, resourceOverride, custom }) {
  const res = resourceOverride || inferResource(endpointKey);
  let defaults = {};

  if (res === "videos") {
    // keep placeholder in case you later add videos resource
    defaults = {};
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

function inferResource(endpointKey) {
  if (!endpointKey || typeof endpointKey !== "string") return null;
  const key = endpointKey.toLowerCase();

  // anything media-related
  const mediaKeys = [
    "media", "home", "featured", "banners",
    "vendor", "partner", "user", "about", "decor",
    "liveband", "live-band", "catering", "mediahosting", "media-hosting",
    "defaultlist", "all", "archived", "stats",
  ];
  if (mediaKeys.some(k => key.includes(k))) return "media";
  if (key.includes("video")) return "videos";
  return null;
}

/* ---------- key normalization utils ---------- */
function toCamelCase(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[-_\s]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

function toMethodSuffix(str) {
  if (typeof str !== "string") return "";
  // turn "live-band" -> "LiveBand", "mediaHosting" -> "MediaHosting", "defaultList" -> "DefaultList"
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

/** map legacy keys to the new ones */
function applyAliases(key) {
  const aliases = {
    userMedia: "user",     // old -> new
    mediaItems: "all",     // old -> new
  };
  return aliases[key] || key;
}
