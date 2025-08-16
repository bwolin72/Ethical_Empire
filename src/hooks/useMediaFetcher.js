// src/hooks/useMediaFetcher.js
import { useState, useEffect } from "react";
import API from "../api/api";           // Your API file with videos
import mediaAPI from "../api/mediaAPI"; // Your media API

// ✅ Path to fallback hero video (must exist in /public/mock/)
const FALLBACK_VIDEO_PATH = "/mock/hero-video.mp4";

export default function useMediaFetcher(endpointKey) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpointKey || typeof endpointKey !== "string") {
      console.warn("[useMediaFetcher] No valid endpoint key provided.");
      setLoading(false);
      return;
    }

    let fetcher = null;

    // 1️⃣ Try in mediaAPI first
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      fetcher = mediaAPI[mediaMethodName];
    }
    // 2️⃣ Then try API.videos
    else if (API?.videos && typeof API.videos[endpointKey] === "function") {
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
      .then((res) => {
        const items = res?.data || [];

        // 🛡 Fallback if no videos returned
        if (isVideoKey(endpointKey) && items.length === 0) {
          console.warn(
            `[useMediaFetcher] No videos found for "${endpointKey}", using fallback.`
          );
          setData([fallbackVideoObject()]);
        } else {
          setData(items);
        }
      })
      .catch((err) => {
        console.error(`❌ API fetch failed for ${endpointKey}:`, err);

        // 🛡 Use fallback on error for videos
        if (isVideoKey(endpointKey)) {
          console.warn(
            `[useMediaFetcher] API error, using fallback video for "${endpointKey}"`
          );
          setData([fallbackVideoObject()]);
          setError(null); // ✅ don’t break UI when falling back
        } else {
          setError(err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpointKey]);

  return { data, loading, error };
}

/* ---------------------------
   🔧 Helpers
---------------------------- */

// Capitalize safely
function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if endpoint relates to videos
function isVideoKey(key) {
  return typeof key === "string" && key.toLowerCase().includes("video");
}

// Fallback video object factory
function fallbackVideoObject() {
  return {
    id: "fallback-video",
    type: "video",
    title: "Fallback Hero Video",
    src: FALLBACK_VIDEO_PATH,
  };
}
