// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';
import apiService from '../api/apiService';

export default function useFetch(apiMethod, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the API method from apiService
      const response = await apiMethod(params);
      setData(response.data || response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
