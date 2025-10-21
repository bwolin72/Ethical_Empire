// src/components/gallery/GalleryWrapper.jsx
import React, { useEffect, useState } from "react";
import useFetcher from "../../hooks/useFetcher";
import MediaGallery from "./MediaGallery";
import placeholderImg from "../../assets/placeholder.jpg";

const GalleryWrapper = ({ endpoint, includeVideos = false }) => {
  const { data: media = [], loading: mediaLoading, error: mediaError } = useFetcher("media", endpoint);
  const { data: videos = [], loading: videoLoading, error: videoError } = useFetcher("videos", endpoint);

  const [items, setItems] = useState([]);

  useEffect(() => {
    const merged = [
      ...(Array.isArray(media)
        ? media.map((m) => ({
            id: `media-${m.id || Math.random()}`,
            url: m.url?.full || m.url?.medium || m.url?.thumbnail || placeholderImg,
            type: m.file_type?.toLowerCase().includes("video") ? "video" : "image",
            title: m.label || m.title || "Media",
            poster: m.url?.thumbnail || placeholderImg,
          }))
        : []),
      ...(includeVideos && Array.isArray(videos)
        ? videos
            .filter((v) => v.is_active)
            .map((v) => ({
              id: `video-${v.id || Math.random()}`,
              url: v.video_file?.url || "",
              type: "video",
              title: v.title || "Video",
              poster: v.thumbnail?.url || placeholderImg,
            }))
        : []),
    ];

    // Sort by type (optional: videos first or featured first)
    merged.sort((a, b) => a.type.localeCompare(b.type));

    setItems(merged);
  }, [media, videos, includeVideos]);

  if (mediaLoading || (includeVideos && videoLoading)) return <p>Loading gallery…</p>;
  if (mediaError || videoError) return <p>Failed to load gallery.</p>;
  if (!items.length) return <p>No gallery items available.</p>;

  return <MediaGallery items={items} />;
};

export default GalleryWrapper;
