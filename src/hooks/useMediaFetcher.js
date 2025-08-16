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
    // ✅ Guard: no key provided
    if (!endpointKey || typeof endpointKey !== "string") {
      console.warn("[useMediaFetcher] No valid endpoint key provided.");
      setLoading(false);
      return;
    }

    let fetcher = null;

    // 1️⃣ Check mediaAPI first
    const mediaMethodName = `get${capitalize(endpointKey)}`;
    if (typeof mediaAPI[mediaMethodName] === "function") {
      fetcher = mediaAPI[mediaMethodName];
    }
    // 2️⃣ Then fallback to API.videos
    else if (API?.videos && typeof API.videos[endpointKey] === "function") {
      fetcher = API.videos[endpointKey];
    }
    // 3️⃣ No matching fetcher
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
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
          ? res.data.results
          : [];

        // 🛡 Handle video fallback
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
          // 🔑 Unauthorized → force login again
          setError("Unauthorized – please log in again.");
          setData([]);
        } else if (isVideoKey(endpointKey)) {
          console.warn(
            `[useMediaFetcher] API error, using fallback video for "${endpointKey}"`
          );
          setData([fallbackVideoObject()]);
          setError(null); // ✅ don’t block UI if fallback works
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

// Capitalize safely
function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if key is related to video endpoints
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
