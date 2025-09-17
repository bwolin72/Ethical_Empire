import React, { useEffect, useState } from "react";
import useFetcher from "../../hooks/useFetcher";
import MediaGallery from "./MediaGallery";

const GalleryWrapper = ({ endpoint, includeVideos = false }) => {
  const { data: media, loading: mediaLoading, error: mediaError } =
    useFetcher("media", endpoint);

  const { data: videos, loading: videoLoading, error: videoError } =
    useFetcher("videos", endpoint);

  const [items, setItems] = useState([]);

  useEffect(() => {
    let merged = [];
    if (media) {
      merged = media.map((m) => ({
        id: `media-${m.id}`,
        url: m.file,
        type: m.type, // "image" | "video"
        title: m.title || "Media",
      }));
    }
    if (includeVideos && videos) {
      merged = [
        ...merged,
        ...videos.map((v) => ({
          id: `video-${v.id}`,
          url: v.video_file,
          type: "video",
          title: v.title || "Video",
        })),
      ];
    }
    setItems(merged);
  }, [media, videos, includeVideos]);

  if (mediaLoading || (includeVideos && videoLoading)) return <p>Loading gallery...</p>;
  if (mediaError || videoError) return <p>Failed to load gallery.</p>;

  return <MediaGallery items={items} />;
};

export default GalleryWrapper;
