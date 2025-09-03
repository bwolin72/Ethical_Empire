// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import mediaAPI from "../api/mediaAPI";
import videoService from "../api/services/videoService";
import endpointMap from "../api/services/endpointMap";
import videosAPI from "../api/videosAPI";
import promotionsAPI from "../api/promotionsAPI";

const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

export default function useFetcher(resourceType, endpointKey, params = null, options = {}) {
  const {
    notify,
    successMessages = {},
    errorMessages = {},
    transform,
    resource,
    mutation,
    fallback = true, // optional fallback for videos
  } = options;

  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const stableEndpointKey = useMemo(() => endpointKey, [endpointKey]);

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
    // ✅ Promotions support
    if (resourceType === "promotions") {
      if (!stableEndpointKey || stableEndpointKey === "list" || stableEndpointKey === "all") {
        return () => publicAxios.get(promotionsAPI.list, stableParams ? { params: stableParams } : undefined);
      }
      if (stableEndpointKey === "active") {
        return () => publicAxios.get(promotionsAPI.active, stableParams ? { params: stableParams } : undefined);
      }
      if (stableEndpointKey === "detail") {
        return (id) => publicAxios.get(promotionsAPI.detail(id));
      }

      const val = promotionsAPI?.[stableEndpointKey];
      if (typeof val === "string") {
        return () => publicAxios.get(val, stableParams ? { params: stableParams } : undefined);
      }
    }

    if (!stableEndpointKey || typeof stableEndpointKey !== "string") {
      if (resourceType === "media")
        return () =>
          publicAxios.get(mediaAPI.defaultList, stableParams ? { params: stableParams } : undefined);
      if (resourceType === "videos") return () => videoService.list(stableParams);
      return null;
    }

    if (resourceType === "media") {
      const genericKeys = new Set(["media", "defaultList", "all", "default", "list"]);
      if (genericKeys.has(stableEndpointKey))
        return () =>
          publicAxios.get(mediaAPI.defaultList, stableParams ? { params: stableParams } : undefined);

      const mediaMethodName = `get${toMethodSuffix(stableEndpointKey)}`;
      if (typeof mediaAPI[mediaMethodName] === "function")
        return () => mediaAPI[mediaMethodName](stableParams);

      const keyCandidates = uniqueNonEmpty([
        stableEndpointKey,
        applyAliases(stableEndpointKey),
        toCamelCase(stableEndpointKey),
        applyAliases(toCamelCase(stableEndpointKey)),
      ]);

      const adminKeys = new Set(["all", "archived", "stats", "debugProto", "upload", "reorder"]);

      for (const k of keyCandidates) {
        const val = mediaAPI?.[k];
        if (typeof val === "string") {
          const useAuth = adminKeys.has(k);
          return () =>
            useAuth
              ? axiosInstance.get(val, stableParams ? { params: stableParams } : undefined)
              : publicAxios.get(val, stableParams ? { params: stableParams } : undefined);
        }
        if (typeof val === "function") return () => val(stableParams);
      }

      if (stableEndpointKey.startsWith("/")) {
        return () =>
          publicAxios.get(stableEndpointKey, stableParams ? { params: stableParams } : undefined);
      }
    }

    if (resourceType === "videos") {
      if (endpointMap && endpointMap[stableEndpointKey])
        return () => videoService.byEndpoint(endpointMap[stableEndpointKey], stableParams);

      const videoKeyCandidates = uniqueNonEmpty([
        stableEndpointKey,
        toCamelCase(stableEndpointKey),
        applyAliases(stableEndpointKey),
      ]);
      for (const k of videoKeyCandidates) {
        if (typeof videosAPI[k] === "string")
          return () =>
            publicAxios.get(videosAPI[k], stableParams ? { params: stableParams } : undefined);
      }

      return () => videoService.list(stableParams);
    }

    return null;
  }, [resourceType, stableEndpointKey, stableParams]);

  // -------------------------
  // Fetch Data
  // -------------------------
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

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetcher();
      let items = extractItems(res);

      if (resourceType === "videos" && fallback && Array.isArray(items) && items.length === 0) {
        if (mountedRef.current) setData([fallbackVideoObject()]);
        return;
      }

      const finalItems = typeof transform === "function" ? transform(items) : items;
      if (mountedRef.current) setData(finalItems);
    } catch (err) {
      const normalizedError = {
        message: err.response?.data?.detail || err.message,
        status: err.response?.status || null,
        data: err.response?.data || null,
      };
      console.error(`❌ API fetch failed for ${resourceType}:${stableEndpointKey}`, normalizedError);

      if (resourceType === "videos" && fallback) {
        if (mountedRef.current) {
          setData([fallbackVideoObject()]);
          setError(null);
        }
      } else {
        if (mountedRef.current) {
          setData([]);
          setError(normalizedError);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [getFetcher, resourceType, stableEndpointKey, transform, fallback]);

  // -------------------------
  // Mutation endpoints
  // -------------------------
  const endpoints = useMemo(
    () =>
      buildMutationEndpoints({
        resourceType,
        endpointKey: stableEndpointKey,
        resourceOverride: resource,
        custom: mutation,
      }),
    [resourceType, stableEndpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) =>
    typeof eps.create === "function" ? eps.create() : eps.create;
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
  const res = resourceOverride || inferResource(resourceType);
  let defaults = {};

  if (res === "videos") {
    defaults = {
      create: () => videosAPI.defaultList,
      update: (id) => videosAPI.detail(id),
      patch: (id) => videosAPI.detail(id),
      remove: (id) => videosAPI.detail(id),
    };
  } else if (res === "media") {
    const createFn = () =>
      typeof mediaAPI.upload === "function" ? mediaAPI.upload() : mediaAPI.upload;
    const updateFn = (id) =>
      typeof mediaAPI.update === "function"
        ? mediaAPI.update(id)
        : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.update)}${id}/update/`;
    const deleteFn = (id) =>
      typeof mediaAPI.delete === "function"
        ? mediaAPI.delete(id)
        : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.delete)}${id}/delete/`;

    defaults = {
      create: createFn,
      update: updateFn,
      patch: updateFn,
      remove: deleteFn,
    };
  } else if (res === "promotions") {
    defaults = {
      create: promotionsAPI.create,
      update: (id) => promotionsAPI.update(id),
      patch: (id) => promotionsAPI.update(id),
      remove: (id) => promotionsAPI.delete(id),
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
  if (resourceType === "promotions") return "promotions";
  return null;
}

function ensureTrailingSlash(str) {
  if (!str || typeof str !== "string") return "/";
  return str.endsWith("/") ? str : `${str}/`;
}

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
