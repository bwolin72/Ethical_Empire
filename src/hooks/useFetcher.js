import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "../api/apiService";      // <-- single entry
import axiosInstance from "../api/axiosInstance";

const DEFAULT_ENDPOINT = "list";

export default function useFetcher(resourcePath, paramsOrOptions = {}, options = {}) {
  /**
   * resourcePath can be:
   *  - string: "media.list" or "services.about"
   *  - function: custom fetcher: () => axiosInstance.get(...)
   */

  let fetcherFn, resourceKey = "", params = {};

  if (typeof resourcePath === "function") {
    fetcherFn = resourcePath;
    params = paramsOrOptions || {};
    options = options || {};
  } else if (typeof resourcePath === "string") {
    resourceKey = resourcePath.includes(".")
      ? resourcePath
      : `${resourcePath}.${DEFAULT_ENDPOINT}`;
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
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => () => (mountedRef.current = false), []);

  const extractItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.results)) return res.data.results;
    return [];
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let res;
      if (fetcherFn) {
        res = await fetcherFn(params);
      } else {
        const apiCall = apiService[resourceKey];
        if (typeof apiCall !== "function") {
          throw new Error(`Unknown API endpoint: ${resourceKey}`);
        }
        res = await apiCall(params);
      }

      let items = extractItems(res);

      if (fallback && (!items || items.length === 0)) {
        // Example fallback objects if desired
        if (resourceKey.startsWith("videos"))
          items = [{ id: "fallback-video", url: "/mock/hero-video.mp4" }];
        if (resourceKey.startsWith("media"))
          items = [{ id: "fallback-banner", url: "/mock/banner-1.png" }];
      }

      if (mountedRef.current) {
        setData(typeof transform === "function" ? transform(items) : items);
      }
    } catch (err) {
      console.error("[useFetcher] API request failed:", err);
      const normalizedError = {
        message: err?.response?.data?.detail || err?.message,
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
  }, [fetcherFn, resourceKey, fallback, transform, params]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, JSON.stringify(params)]);

  // ---- CRUD helpers ----
  const post = async (payload) => {
    if (!resourceKey) throw new Error("[useFetcher] post() needs resourceKey");
    try {
      const res = await axiosInstance.post(`/${resourceKey.split(".")[0]}/`, payload);
      notify?.("success", successMessages.post || "Created successfully.");
      await fetchData();
      return res;
    } catch (err) {
      notify?.("error", errorMessages.post || "Create failed.");
      throw err;
    }
  };

  const patch = async (id, payload) => {
    const res = await axiosInstance.patch(`/${resourceKey.split(".")[0]}/${id}/`, payload);
    await fetchData();
    return res;
  };

  const remove = async (id) => {
    const res = await axiosInstance.delete(`/${resourceKey.split(".")[0]}/${id}/`);
    await fetchData();
    return res;
  };

  return { data, loading, error, refetch: fetchData, post, patch, remove };
}
