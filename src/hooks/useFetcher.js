// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "../api/apiService"; // { API_ENDPOINTS, FLAT_ENDPOINTS }
import axiosInstance from "../api/axiosInstance";

const DEFAULT_ENDPOINTS = {
  videos: "home",   // default video endpoint
  media: "home",
  promotions: "active",
  reviews: "all",
  services: "all",
  invoices: "list",
  messaging: "list",
};

const FALLBACK_ENDPOINT = "list";
const FALLBACK_TRY_ORDER = ["home", "active", "all", "list"];

function toCamel(s = "") {
  return s.replace(/[-_](.)/g, (_, c) => (c ? c.toUpperCase() : ""));
}
function toSnake(s = "") {
  return s.replace(/-/g, "_").replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).replace(/^_/, "");
}
function toKebab(s = "") {
  return s.replace(/_/g, "-").replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`).replace(/^-/, "");
}

function findApiCall(group, action) {
  if (!group) return null;

  const flatKey = `${group}.${action}`;
  const flatCall = apiService.FLAT_ENDPOINTS?.[flatKey];
  if (typeof flatCall === "function") return { fn: flatCall, key: flatKey };

  const groupObj = apiService.API_ENDPOINTS?.[group];
  if (!groupObj) return null;

  const candidates = [
    action,
    toCamel(action),
    toSnake(action),
    toKebab(action),
    action.replace("-", "_"),
    action.replace("_", "-"),
  ].filter(Boolean);

  for (const cand of candidates) {
    if (typeof groupObj[cand] === "function") return { fn: groupObj[cand], key: `${group}.${cand}` };
  }

  return null;
}

function resolveApiCall(resourceKey) {
  if (!resourceKey) return null;
  const [group, action] = resourceKey.split(".");
  if (!group) return null;

  if (action) {
    const found = findApiCall(group, action);
    if (found) return found;
    console.warn(`[useFetcher] Endpoint "${resourceKey}" not found, trying fallback.`);
  }

  const defaultAction = DEFAULT_ENDPOINTS[group] || null;
  if (defaultAction) {
    const foundDefault = findApiCall(group, defaultAction);
    if (foundDefault) return foundDefault;
  }

  for (const fallbackAction of FALLBACK_TRY_ORDER) {
    const found = findApiCall(group, fallbackAction);
    if (found) return found;
  }

  return null;
}

export default function useFetcher(resourcePath, paramsOrOptions = {}, options = {}) {
  let fetcherFn = null;
  let resourceKey = "";
  let params = {};

  if (typeof resourcePath === "function") {
    fetcherFn = resourcePath;
    params = paramsOrOptions || {};
  } else if (typeof resourcePath === "string") {
    resourceKey = resourcePath.includes(".")
      ? resourcePath
      : `${resourcePath}.${DEFAULT_ENDPOINTS[resourcePath] || FALLBACK_ENDPOINT}`;
    params = paramsOrOptions || {};
  } else {
    throw new Error("[useFetcher] Invalid arguments");
  }

  const {
    fallback = true,
    transform,
    debug = false,
    notify,
    successMessages = {},
    errorMessages = {},
  } = options;

  const mountedRef = useRef(true);
  useEffect(() => () => (mountedRef.current = false), []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resolvedEndpointRef = useRef(null);

  const extractItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.results)) return res.data.results;

    if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      if (Array.isArray(res.data.items)) return res.data.items;
      if (Array.isArray(res.data.results)) return res.data.results;
      return [res.data];
    }
    return [];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    resolvedEndpointRef.current = null;

    try {
      let res;
      if (fetcherFn) {
        res = await fetcherFn(params);
        resolvedEndpointRef.current = "custom_fetcher";
      } else {
        const resolved = resolveApiCall(resourceKey);
        if (!resolved) throw new Error(`Unknown API endpoint: ${resourceKey}`);
        resolvedEndpointRef.current = resolved.key;
        res = await resolved.fn(params);
      }

      let items = extractItems(res);

      // --- VIDEO-specific fallback ---
      if (fallback && resourceKey.startsWith("videos") && (!items || items.length === 0)) {
        items = [
          {
            id: "fallback-video",
            video_file: "/mock/hero-video.mp4",
            thumbnail: "/mock/hero-thumb.jpg",
            title: "Fallback Video",
            description: "",
            is_active: true,
            is_featured: false,
          },
        ];
      }

      if (mountedRef.current) {
        setData(typeof transform === "function" ? transform(items) : items);
      }
    } catch (err) {
      console.error("[useFetcher] API request failed:", err);
      if (mountedRef.current) {
        setError({
          message: err?.response?.data?.detail || err?.message || String(err),
          status: err?.response?.status || null,
          data: err?.response?.data || null,
        });
        setData([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetcherFn, resourceKey, fallback, transform, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [resourceKey, JSON.stringify(params)]);

  // CRUD helpers
  const getGroup = () => (resourceKey ? resourceKey.split(".")[0] : null);

  const post = async (payload) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] post() needs resourceKey");
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj?.create) {
      const res = await serviceObj.create(payload);
      await fetchData();
      notify?.("success", successMessages.post || "Created successfully.");
      return res;
    }
    const res = await axiosInstance.post(`/${group}/`, payload);
    await fetchData();
    return res;
  };

  const patch = async (id, payload) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] patch() needs resourceKey and id");
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj?.update) {
      const res = await serviceObj.update(id, payload);
      await fetchData();
      return res;
    }
    const res = await axiosInstance.patch(`/${group}/${id}/`, payload);
    await fetchData();
    return res;
  };

  const remove = async (id) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] remove() needs resourceKey and id");
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj?.delete) {
      const res = await serviceObj.delete(id);
      await fetchData();
      return res;
    }
    const res = await axiosInstance.delete(`/${group}/${id}/`);
    await fetchData();
    return res;
  };

  const returnObj = { data, loading, error, refetch: fetchData, post, patch, remove };
  if (debug) return { ...returnObj, resolvedEndpoint: resolvedEndpointRef.current };

  return returnObj;
}
