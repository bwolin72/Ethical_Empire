// src/hooks/useMediaFetcher.js
import { useState, useEffect } from 'react';
import API from '../api/api';           // Your API file that has videos
import mediaAPI from '../api/mediaAPI'; // Your media API

export default function useMediaFetcher(endpointKey) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpointKey) {
      console.warn('[useMediaFetcher] No endpoint key provided.');
      setLoading(false);
      return;
    }

    let fetcher = null;

    // 1️⃣ First, try to find in mediaAPI
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === 'function') {
      fetcher = mediaAPI[mediaMethodName];
    }

    // 2️⃣ If not found, try in API.videos
    else if (API?.videos && typeof API.videos[endpointKey] === 'function') {
      fetcher = API.videos[endpointKey];
    }

    // 3️⃣ If still not found, throw error
    else {
      console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
      setError(`Unknown endpoint: ${endpointKey}`);
      setLoading(false);
      return;
    }

    // Fetch data
    setLoading(true);
    fetcher()
      .then(res => {
        setData(res.data || []);
      })
      .catch(err => {
        console.error(`❌ API fetch failed for ${endpointKey}:`, err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [endpointKey]);

  return { data, loading, error };
}

// Helper: Capitalize the first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
