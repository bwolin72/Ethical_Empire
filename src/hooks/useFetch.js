// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * useFetch - React hook for GET requests with axiosInstance.
 *
 * @param {string} url - The API endpoint (relative to baseURL in axiosInstance).
 * @param {object} params - Query parameters for the request.
 * @returns {{ data: any, loading: boolean, error: any, refetch: Function }}
 */
export default function useFetch(url, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(url, { params });
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]); 
  // ⚠️ JSON.stringify is safe for shallow params objects.
  // If params can be big/complex, consider useMemo outside.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
