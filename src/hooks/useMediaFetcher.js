// src/hooks/useMediaFetcher.js
import { useState, useEffect } from "react";
import API from "../api/api";           // ✅ Your API file with videos
import mediaAPI from "../api/mediaAPI"; // ✅ Your media API

// 🔒 Path to fallback hero video (ensure it exists in /public/mock/)
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

    // 1️⃣ Try mediaAPI (images/banners/media)
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      fetcher = mediaAPI[mediaMethodName];
    }
    // 2️⃣ Try API.videos (your VideoViewSet endpoints)
    else if (API?.videos && typeof API.videos[endpointKey] === "function") {
      fetcher = API.videos[endpointKey];
    }
    // 3️⃣ Unknown endpoint
    else {
      console.error(`[useMediaFetcher] Unknown endpoint key: ${endpointKey}`);
      setError(`Unknown endpoint: ${endpointKey}`);
      setLoading(false);
      return;
    }

    // 🚀 Run fetch
    setLoading(true);
    fetcher()
      .then((res) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
          ? res.data.results
          : [];

        // 🛡 Fallback: if this is a video key and nothing is fetched → use local hero-video
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

        if (err?.response?.status === 401) {
          setError("Unauthorized – please log in again.");
          setData([]);
        } else if (isVideoKey(endpointKey)) {
          console.warn(
            `[useMediaFetcher] API error, using fallback video for "${endpointKey}"`
          );
          setData([fallbackVideoObject()]);
          setError(null); // don’t block UI if fallback works
        } else {
          setData([]);
          setError(err);
        }
      })
      .finally(() => setLoading(false));
  }, [endpointKey]);

  return { data, loading, error };
}

/* ---------------------------
   🔧 Helpers
---------------------------- */

// Capitalize safely for mediaAPI methods
function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Detect if the endpointKey is video-related
function isVideoKey(key) {
  return typeof key === "string" && key.toLowerCase().includes("video");
}

// Local fallback video object
function fallbackVideoObject() {
  return {
    id: "fallback-video",
    type: "video",
    title: "Fallback Hero Video",
    src: FALLBACK_VIDEO_PATH,
    thumbnail: null,
    is_active: true,
    is_featured: true,
  };
}
