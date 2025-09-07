// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import publicAxios from "../api/publicAxios";
import axiosInstance from "../api/axiosInstance";
import promotionsAPI from "../api/promotionsAPI";
import apiService from "../api/apiService";   // ✅ unified wrapper
import videosAPI from "../api/videosAPI";
import mediaAPI from "../api/mediaAPI";

const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";
const FALLBACK_BANNER_PATH = "/mock/banner-1.png";

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

  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const stableEndpointKey = useMemo(() => endpointKey, [endpointKey]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // -------------------------
  // Resolver for GET requests
  // -------------------------
  const getFetcher = useCallback(() => {
    // --------- Promotions ---------
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

    // --------- Media (via apiService) ---------
    if (resourceType === "media") {
      return async () => {
        const items = await apiService.byEndpoint(stableEndpointKey, stableParams);
        return { data: items };
      };
    }

    // --------- Videos (via apiService) ---------
    if (resourceType === "videos") {
      return async () => {
        const items = await apiService.getVideosByEndpoint(stableEndpointKey, stableParams);
        return { data: items };
      };
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

    if (mountedRef.current) { setLoading(true); setError(null); }

    try {
      const res = await fetcher();
      let items = extractItems(res);

      // Apply fallbacks
      if (fallback) {
        if (resourceType === "videos" && (!items || items.length === 0)) {
          if (mountedRef.current) setData([fallbackVideoObject()]);
          return;
        }
        if (resourceType === "media" && (!items || items.length === 0)) {
          if (mountedRef.current) setData([fallbackBannerObject()]);
          return;
        }
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

      if (fallback) {
        if (resourceType === "videos") {
          if (mountedRef.current) { setData([fallbackVideoObject()]); setError(null); }
          return;
        }
        if (resourceType === "media") {
          if (mountedRef.current) { setData([fallbackBannerObject()]); setError(null); }
          return;
        }
      }

      if (mountedRef.current) { setData([]); setError(normalizedError); }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [getFetcher, resourceType, stableEndpointKey, transform, fallback]);

  // -------------------------
  // Mutation Endpoints
  // -------------------------
  const endpoints = useMemo(
    () => buildMutationEndpoints({ resourceType, endpointKey: stableEndpointKey, resourceOverride: resource, custom: mutation }),
    [resourceType, stableEndpointKey, resource, mutation]
  );

  const resolveCreateUrl = (eps) => typeof eps.create === "function" ? eps.create() : eps.create;
  const resolvePatchUrl = (eps, id) => typeof eps.patch === "function" ? eps.patch(id) : eps.patch;
  const resolveRemoveUrl = (eps, id) => typeof eps.remove === "function" ? eps.remove(id) : eps.remove;

  // -------------------------
  // CRUD Operations (Optimistic)
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

  // Fetch on mount
  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData, post, patch, remove };
}

// -------------------------
// Helpers
// -------------------------
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

function fallbackBannerObject() {
  return {
    id: "fallback-banner",
    type: "image",
    title: "Fallback Banner",
    image_url: FALLBACK_BANNER_PATH,
    thumbnail: FALLBACK_BANNER_PATH,
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
      create: () => videosAPI.defaultList,
      update: id => videosAPI.detail(id),
      patch: id => videosAPI.detail(id),
      remove: id => videosAPI.detail(id),
    };
  } else if (res === "media") {
    const createFn = () => (typeof mediaAPI.upload === "function" ? mediaAPI.upload() : mediaAPI.upload);
    const updateFn = id => (typeof mediaAPI.update === "function" ? mediaAPI.update(id) : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.update)}${id}/update/`);
    const deleteFn = id => (typeof mediaAPI.delete === "function" ? mediaAPI.delete(id) : `${ensureTrailingSlash(mediaAPI.defaultBase || mediaAPI.delete)}${id}/delete/`);
    defaults = { create: createFn, update: updateFn, patch: updateFn, remove: deleteFn };
  } else if (res === "promotions") {
    defaults = { create: promotionsAPI.create, update: id => promotionsAPI.update(id), patch: id => promotionsAPI.update(id), remove: id => promotionsAPI.delete(id) };
  }

  return { create: custom?.create || defaults.create, update: custom?.update || defaults.update, patch: custom?.patch || defaults.patch, remove: custom?.remove || defaults.remove };
}

function inferResource(resourceType) {
  if (resourceType === "videos") return "videos";
  if (resourceType === "media") return "media";
  if (resourceType === "promotions") return "promotions";
  return null;
}

function ensureTrailingSlash(str) { return !str || typeof str !== "string" ? "/" : str.endsWith("/") ? str : `${str}/`; }
