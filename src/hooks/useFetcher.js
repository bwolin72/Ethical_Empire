// src/hooks/useFetcher.js
import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "../api/apiService";      // { API_ENDPOINTS, FLAT_ENDPOINTS }
import axiosInstance from "../api/axiosInstance";

// sensible defaults per your API design
const DEFAULT_ENDPOINTS = {
  videos: "home",
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

/**
 * Find API function in apiService by trying:
 * 1) FLAT_ENDPOINTS['group.action']
 * 2) API_ENDPOINTS[group][action] for many action variants
 */
function findApiCall(group, action) {
  if (!group) return null;

  const flatKey = `${group}.${action}`;
  const flatCall = apiService.FLAT_ENDPOINTS?.[flatKey];
  if (typeof flatCall === "function") return { fn: flatCall, key: flatKey, reason: "flat" };

  const groupObj = apiService.API_ENDPOINTS?.[group];
  if (!groupObj) return null;

  // candidate forms to try (keeps order deterministic)
  const candidates = [
    action,
    toCamel(action),
    toSnake(action),
    toKebab(action),
    action.replace("-", "_"),
    action.replace("_", "-"),
  ]
    .filter(Boolean)
    .map((c) => String(c));

  for (const cand of candidates) {
    if (typeof groupObj[cand] === "function") return { fn: groupObj[cand], key: `${group}.${cand}`, reason: `matched:${cand}` };
  }

  return null;
}

/**
 * Try to resolve a resource key (group.action). If action not found,
 * try fallback sequence and return the first valid api function.
 */
function resolveApiCall(resourceKey) {
  if (!resourceKey) return null;
  const [group, action] = resourceKey.split(".");
  if (!group) return null;

  // If explicit action provided, try it first
  if (action) {
    const found = findApiCall(group, action);
    if (found) return found;
    // not found: warn but continue to fallback later
    console.warn(`[useFetcher] Requested endpoint "${resourceKey}" not found; attempting fallbacks.`);
  }

  // Try default action for group
  const defaultAction = DEFAULT_ENDPOINTS[group] || null;
  if (defaultAction) {
    const foundDefault = findApiCall(group, defaultAction);
    if (foundDefault) {
      console.info(`[useFetcher] Using default endpoint "${group}.${defaultAction}" for "${resourceKey}".`);
      return foundDefault;
    }
  }

  // Try common fallback list
  for (const fallbackAction of FALLBACK_TRY_ORDER) {
    const found = findApiCall(group, fallbackAction);
    if (found) {
      console.info(`[useFetcher] Falling back to "${group}.${fallbackAction}".`);
      return found;
    }
  }

  // No mapping found
  return null;
}

export default function useFetcher(resourcePath, paramsOrOptions = {}, options = {}) {
  /**
   * resourcePath:
   *  - string: "media.about" or "videos" or "videos.all"
   *  - function: custom fetcher (fn that returns axios promise)
   */

  let fetcherFn = null;
  let resourceKey = "";
  let params = {};

  if (typeof resourcePath === "function") {
    fetcherFn = resourcePath;
    params = paramsOrOptions || {};
    options = options || {};
  } else if (typeof resourcePath === "string") {
    // if no dot, pick default action for the resource
    resourceKey = resourcePath.includes(".")
      ? resourcePath
      : `${resourcePath}.${DEFAULT_ENDPOINTS[resourcePath] || FALLBACK_ENDPOINT}`;
    params = paramsOrOptions || {};
    options = options || {};
  } else {
    throw new Error("[useFetcher] Invalid arguments");
  }

  const {
    notify,
    successMessages = {},
    errorMessages = {},
    transform,
    fallback = true,
    debug = false, // optional: if true returns resolvedEndpoint in return
  } = options;

  const mountedRef = useRef(true);
  useEffect(() => () => (mountedRef.current = false), []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // optional local store of the resolved endpoint used (for debugging)
  const resolvedEndpointRef = useRef(null);

  const extractItems = (res) => {
    if (!res) return [];
    // standard paginated API
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.results)) return res.data.results;
    // sometimes backend returns a single object as data
    if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      // If it's a plain object with known keys, make best effort:
      if (Array.isArray(res.data.items)) return res.data.items;
      if (Array.isArray(res.data.results)) return res.data.results;
      // else return the raw data object wrapped (so caller can transform)
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
        // custom fetcher provided by consumer
        res = await fetcherFn(params);
        resolvedEndpointRef.current = "custom_fetcher";
      } else {
        // resolve the correct API function via mapping
        const resolved = resolveApiCall(resourceKey);
        if (!resolved) {
          throw new Error(`Unknown API endpoint (no mapping found): ${resourceKey}`);
        }
        resolvedEndpointRef.current = resolved.key;
        res = await resolved.fn(params);
      }

      let items = extractItems(res);

      // fallback mocks for media/videos if empty and fallback allowed
      if (fallback && (!items || items.length === 0)) {
        if (resolvedEndpointRef.current?.startsWith("videos")) {
          items = [{ id: "fallback-video", url: { full: "/mock/hero-video.mp4" }, file_type: "video/mp4" }];
          console.info("[useFetcher] Using fallback video item.");
        } else if (resolvedEndpointRef.current?.startsWith("media")) {
          items = [{ id: "fallback-banner", url: { full: "/mock/banner-1.png" }, file_type: "image/jpeg" }];
          console.info("[useFetcher] Using fallback media item.");
        }
      }

      if (mountedRef.current) {
        const finalData = typeof transform === "function" ? transform(items) : items;
        setData(finalData);
      }
    } catch (err) {
      console.error("[useFetcher] API request failed:", err);
      const normalizedError = {
        message: err?.response?.data?.detail || err?.message || String(err),
        status: err?.response?.status || null,
        data: err?.response?.data || null,
      };
      if (mountedRef.current) {
        setError(normalizedError);
        setData([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [fetcherFn, resourceKey, fallback, transform, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, JSON.stringify(params)]);

  // ---- CRUD helpers ----
  const getGroup = () => (resourceKey ? resourceKey.split(".")[0] : null);

  // Try to use apiService-defined helper functions for create/update/delete
  const post = async (payload) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] post() needs resourceKey");

    // If apiService defines an admin/create endpoint, prefer it. Look for common names:
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj) {
      // prefer create, then 'all' (to POST to same resource base as list may indicate base path)
      if (typeof serviceObj.create === "function") {
        const res = await serviceObj.create(payload);
        await fetchData();
        notify?.("success", successMessages.post || "Created successfully.");
        return res;
      }
      // fallback: some services may use POST to the base resource (best-effort)
      // We'll try to POST to `/${group}/` as a fallback.
    }

    console.warn(`[useFetcher] Falling back to generic POST for /${group}/ — ensure this matches your API.`);
    const res = await axiosInstance.post(`/${group}/`, payload);
    await fetchData();
    notify?.("success", successMessages.post || "Created successfully.");
    return res;
  };

  const patch = async (id, payload) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] patch() needs resourceKey and id");

    // try to find dedicated patch endpoint in apiService, otherwise fallback to generic
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj) {
      if (typeof serviceObj.update === "function") {
        const res = await serviceObj.update(id, payload);
        await fetchData();
        return res;
      }
      if (typeof serviceObj.detail === "function") {
        // try patching base detail endpoint
        try {
          const res = await axiosInstance.patch(`/${group}/${id}/`, payload);
          await fetchData();
          return res;
        } catch (err) {
          // fallthrough
        }
      }
    }

    console.warn(`[useFetcher] Falling back to generic PATCH for /${group}/${id}/`);
    const res = await axiosInstance.patch(`/${group}/${id}/`, payload);
    await fetchData();
    return res;
  };

  const remove = async (id) => {
    const group = getGroup();
    if (!group) throw new Error("[useFetcher] remove() needs resourceKey and id");

    // try to use an explicit delete helper if present (e.g., reviews.delete)
    const serviceObj = apiService.API_ENDPOINTS?.[group];
    if (serviceObj) {
      if (typeof serviceObj.delete === "function") {
        const res = await serviceObj.delete(id);
        await fetchData();
        return res;
      }
      // some endpoints have custom delete path like /reviews/{id}/delete/
      if (typeof serviceObj.delete === "undefined" && typeof serviceObj.all === "function") {
        // fallback generic delete
        try {
          const res = await axiosInstance.delete(`/${group}/${id}/`);
          await fetchData();
          return res;
        } catch (err) {
          // fallthrough
        }
      }
    }

    console.warn(`[useFetcher] Falling back to generic DELETE for /${group}/${id}/`);
    const res = await axiosInstance.delete(`/${group}/${id}/`);
    await fetchData();
    return res;
  };

  const returnObj = { data, loading, error, refetch: fetchData, post, patch, remove };
  if (debug) return { ...returnObj, resolvedEndpoint: resolvedEndpointRef.current };

  return returnObj;
}
