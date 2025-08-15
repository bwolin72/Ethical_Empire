// src/hooks/useMediaFetcher.js
import { useState, useEffect } from 'react';
import API from '../api/api';           // Your API file with videos
import mediaAPI from '../api/mediaAPI'; // Your media API

// Path to fallback hero video
const FALLBACK_VIDEO_PATH = '/mock/hero-video.mp4';

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

    // 1️⃣ Try in mediaAPI first
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === 'function') {
      fetcher = mediaAPI[mediaMethodName];
    }

    // 2️⃣ Then try API.videos
    else if (API?.videos && typeof API.videos[endpointKey] === 'function') {
      fetcher = API.videos[endpointKey];
    }

    // 3️⃣ If nothing found
    else {
      console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
      setError(`Unknown endpoint: ${endpointKey}`);
      setLoading(false);
      return;
    }

    // 🚀 Fetch data
    setLoading(true);
    fetcher()
      .then(res => {
        const items = res.data || [];

        // 🛡 If no data & this is a video request, use fallback
        if (isVideoKey(endpointKey) && items.length === 0) {
          console.warn(`[useMediaFetcher] No videos found for "${endpointKey}", using fallback.`);
          setData([
            {
              id: 'fallback-video',
              type: 'video',
              title: 'Fallback Hero Video',
              src: FALLBACK_VIDEO_PATH
            }
          ]);
        } else {
          setData(items);
        }
      })
      .catch(err => {
        console.error(`❌ API fetch failed for ${endpointKey}:`, err);

        // In case of error, fallback for videos
        if (isVideoKey(endpointKey)) {
          console.warn(`[useMediaFetcher] API error, using fallback video for "${endpointKey}"`);
          setData([
            {
              id: 'fallback-video',
              type: 'video',
              title: 'Fallback Hero Video',
              src: FALLBACK_VIDEO_PATH
            }
          ]);
        }
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [endpointKey]);

  return { data, loading, error };
}

// Helper: Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper: Check if endpoint key relates to videos
function isVideoKey(key) {
  return key.toLowerCase().includes('video');
}
