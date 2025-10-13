// src/components/videos/VideoGallery.jsx
import React from "react";
import PropTypes from "prop-types";
import useFetcher from "../../hooks/useFetcher";
import "./videos.css";

const VideoGallery = ({
  endpointKey = "",       // e.g. "LiveBandServicePage", "MediaHostingServicePage"
  fallbackVideo,
  title,
  showHero = false,
  autoPlay = false,
  loop = false,
  allowMuteToggle = false,
  className,
  actions = [],
}) => {
  // Fetch videos for a specific endpoint
  const { data: videos = [], loading, error } = useFetcher(`videos.${endpointKey}`);

  // Filter only active videos
  const activeVideos = Array.isArray(videos)
    ? videos.filter((v) => v.is_active)
    : [];

  // Determine hero video: first featured video, else first active
  const featuredVideos = activeVideos.filter((v) => v.is_featured);
  const heroVideo = showHero
    ? featuredVideos[0] || activeVideos[0] || { video_file: fallbackVideo }
    : null;

  const resolveVideoUrl = (video) =>
    video?.video_file?.url || video?.video_file || fallbackVideo;

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

      {showHero && heroVideo ? (
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
      ) : null}

      {activeVideos.length > 0 ? (
        <div className="video-grid">
          {activeVideos.map((video) => (
            <div key={video.id} className="video-card">
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
