// src/components/gallery/GalleryWrapper.jsx
import React, { useEffect, useState } from "react";
import useFetcher from "../../hooks/useFetcher";
import mediaService from "../../api/services/mediaService";
import videoService from "../../api/services/videoService";
import MediaGallery from "./MediaGallery";

const GalleryWrapper = ({ endpoint, includeVideos = false }) => {
  const { data: media, loading: mediaLoading, error: mediaError, fetchData: fetchMedia } =
    useFetcher(() => mediaService.getMediaByEndpoint(endpoint));

  const { data: videos, loading: videoLoading, error: videoError, fetchData: fetchVideos } =
    useFetcher(() => videoService.getVideosByEndpoint(endpoint));

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMedia();
    if (includeVideos) fetchVideos();
  }, [endpoint, includeVideos]);

  useEffect(() => {
    let merged = [];
    if (media?.results) {
      merged = [
        ...media.results.map((m) => ({
          id: `media-${m.id}`,
          url: m.file,
          type: m.type, // "image" | "video"
          title: m.title || "Media",
        })),
      ];
    }
    if (includeVideos && videos?.results) {
      merged = [
        ...merged,
        ...videos.results.map((v) => ({
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
