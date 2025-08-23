import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

/**
 * useFetch - React hook for GET requests with axiosInstance.
 *
 * @param {string} url - The API endpoint (relative to baseURL).
 * @param {object} params - Query parameters.
 * @param {any} initialData - Optional initial state for data.
 * @returns {{ data: any, loading: boolean, error: any, refetch: Function }}
 */
export default function useFetch(url, params = {}, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(url, {
        params,
        signal: controller.signal,
      });

      setData(response.data);
    } catch (err) {
      if (err.name !== "CanceledError" && !axiosInstance.isCancel?.(err)) {
        // Normalize error
        setError({
          message: err.response?.data?.detail || err.message,
          status: err.response?.status || null,
          data: err.response?.data || null,
        });
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    const cancel = fetchData();
    return () => {
      if (typeof cancel === "function") cancel();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
