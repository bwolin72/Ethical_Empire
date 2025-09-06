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
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(url, {
        params,
        signal: controller.signal,
      });
      setData(response.data);
      return response.data; // return data for refetch usage
    } catch (err) {
      if (axiosInstance.isCancel?.(err) || err.name === "CanceledError") {
        // Request was canceled, do nothing
        return;
      }
      setError({
        message: err.response?.data?.detail || err.message,
        status: err.response?.status || null,
        data: err.response?.data || null,
      });
    } finally {
      setLoading(false);
    }

    return () => controller.abort(); // not really needed, handled by useEffect
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData();

    return () => {
      controller.abort(); // abort fetch on unmount
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
