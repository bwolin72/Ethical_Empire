// src/components/videos/VideoGallery.jsx
import React from "react";
import PropTypes from "prop-types";
import useFetcher from "../../hooks/useFetcher";
import "./videos.css";

const VideoGallery = ({
  endpointKey = "all",       // which videos endpoint to call (e.g. "all", "featured")
  fallbackVideo,
  title,
  showHero = false,
  autoPlay = false,
  loop = false,
  allowMuteToggle = false,
  className,
  actions = [],
}) => {
  // Fetch videos from the backend
  const { data: videos = [], loading, error } = useFetcher("videos", endpointKey);

  const hasVideos = Array.isArray(videos) && videos.length > 0;
  const heroVideo = hasVideos ? videos[0] : { url: fallbackVideo };

  const resolveVideoUrl = (video) =>
    video?.url || video?.video_file?.url || video?.video_file || fallbackVideo;

  const resolvePoster = (video) =>
    video?.thumbnail?.url || video?.thumbnail || "";

  if (loading) {
    return (
      <section className={`video-gallery ${className || ""}`}>
        <p>Loading videos…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`video-gallery ${className || ""}`}>
        <p className="error-text">Failed to load videos.</p>
      </section>
    );
  }

  return (
    <section className={`video-gallery ${className || ""}`}>
      {title && <h2>{title}</h2>}

      {showHero ? (
        <div className="hero-video-wrapper">
          <video
            src={resolveVideoUrl(heroVideo)}
            autoPlay={autoPlay}
            loop={loop}
            muted={!allowMuteToggle}
            controls={allowMuteToggle}
            className="hero-video"
          >
            Your browser does not support HTML5 video.
          </video>

          {actions.length > 0 && (
            <div className="hero-actions">
              {actions.map((a, idx) => (
                <button key={idx} onClick={a.onClick} className={a.className}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : hasVideos ? (
        <div className="video-grid">
          {videos.map((video, idx) => (
            <div key={video.id || idx} className="video-card">
              <video
                controls
                src={resolveVideoUrl(video)}
                poster={resolvePoster(video)}
              />
              {video.title && <h3>{video.title}</h3>}
              {video.description && <p>{video.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="video-grid">
          <video controls src={fallbackVideo} className="fallback-video" />
          <p>No videos available. Showing fallback.</p>
        </div>
      )}
    </section>
  );
};

VideoGallery.propTypes = {
  endpointKey: PropTypes.string,
  fallbackVideo: PropTypes.string.isRequired,
  title: PropTypes.string,
  showHero: PropTypes.bool,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  allowMuteToggle: PropTypes.bool,
  className: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      className: PropTypes.string,
    })
  ),
};

export default VideoGallery;
