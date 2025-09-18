import React, { useEffect, useState } from "react";
import useFetcher from "../../hooks/useFetcher";
import MediaGallery from "./MediaGallery";

const GalleryWrapper = ({ endpoint, includeVideos = false }) => {
  const { data: media = [], loading: mediaLoading, error: mediaError } = useFetcher("media", endpoint);
  const { data: videos = [], loading: videoLoading, error: videoError } = useFetcher("videos", endpoint);

  const [items, setItems] = useState([]);

  useEffect(() => {
    const merged = [
      ...(Array.isArray(media)
        ? media.map((m) => ({
            id: `media-${m.id || Math.random()}`,
            url: m.file || "",
            type: m.type || "image",
            title: m.title || "Media",
          }))
        : []),
      ...(includeVideos && Array.isArray(videos)
        ? videos.map((v) => ({
            id: `video-${v.id || Math.random()}`,
            url: v.video_file || "",
            type: "video",
            title: v.title || "Video",
          }))
        : []),
    ];
    setItems(merged);
  }, [media, videos, includeVideos]);

  if (mediaLoading || (includeVideos && videoLoading)) return <p>Loading gallery...</p>;
  if (mediaError || videoError) return <p>Failed to load gallery.</p>;
  if (items.length === 0) return <p>No gallery items available.</p>;

  return <MediaGallery items={items} />;
};

export default GalleryWrapper;
