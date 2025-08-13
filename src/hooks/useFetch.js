// src/hooks/useFetch.js
import { useState, useEffect, useCallback, useRef } from 'react';

export default function useFetch(apiMethod, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store params in a ref to avoid triggering fetchData if params object is recreated but content unchanged
  const paramsRef = useRef(params);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiMethod(paramsRef.current);
      setData(response.data || response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod]);

  useEffect(() => {
    paramsRef.current = params;
    fetchData();
  }, [params, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
