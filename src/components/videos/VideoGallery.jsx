// src/components/videos/VideoGallery.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import videoService from "../../api/services/videoService";
import "./videos.css";

/**
 * Generic VideoGallery
 * Usage:
 *   <VideoGallery endpoint="LiveBandServicePage" title="Live Band Videos" />
 *   <VideoGallery endpoint="CateringServicePage" title="Catering Highlights" limit={4} />
 *
 * Props:
 *   - endpoint: string (E.g. "About", "LiveBandServicePage", "media-hosting")
 *   - title: optional section heading
 *   - limit: optional max number of videos to show
 *   - className: optional extra classes
 */
const VideoGallery = ({ endpoint, title, limit, className }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      try {
        setLoading(true);
        const res = await videoService.byEndpoint(endpoint, { is_active: true });
        const data = res?.results || res || [];
        const sliced = limit ? data.slice(0, limit) : data;
        if (isMounted) setVideos(sliced);
      } catch (err) {
        console.error("❌ Failed to load videos for endpoint:", endpoint, err);
        toast.error("Could not load videos. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, [endpoint, limit]);

  return (
    <section className={`video-gallery ${className || ""}`}>
      {title && <h2>{title}</h2>}

      {loading ? (
        <p className="status">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="status">No videos available.</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              {/* Thumbnail / Video */}
              {video.thumbnail ? (
                <img
                  src={video.thumbnail?.url || video.thumbnail}
                  alt={video.title}
                />
              ) : (
                <video
                  controls
                  src={video.video_file?.url || video.video_file}
                />
              )}

              {/* Info */}
              <div className="video-card-content">
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}

                <video
                  controls
                  src={video.video_file?.url || video.video_file}
                  poster={video.thumbnail?.url || video.thumbnail}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

VideoGallery.propTypes = {
  endpoint: PropTypes.string.isRequired,
  title: PropTypes.string,
  limit: PropTypes.number,
  className: PropTypes.string,
};

export default VideoGallery;
