// src/components/videos/VideoGallery.jsx
import React from "react";
import PropTypes from "prop-types";
import "./videos.css";

const VideoGallery = ({
  videos = [],
  fallbackVideo,
  title,
  showHero = false,
  autoPlay = false,
  loop = false,
  allowMuteToggle = false,
  className,
  actions = [],
}) => {
  const hasVideos = videos.length > 0;
  const heroVideo = hasVideos ? videos[0] : { url: fallbackVideo };

  return (
    <section className={`video-gallery ${className || ""}`}>
      {title && <h2>{title}</h2>}

      {showHero ? (
        <div className="hero-video-wrapper">
          <video
            src={heroVideo.url || fallbackVideo}
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
                <button
                  key={idx}
                  onClick={a.onClick}
                  className={a.className}
                >
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
                src={video.video_file?.url || video.video_file || fallbackVideo}
                poster={video.thumbnail?.url || video.thumbnail}
              />
              {video.title && <h3>{video.title}</h3>}
              {video.description && <p>{video.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="video-grid">
          <video
            controls
            src={fallbackVideo}
            className="fallback-video"
          />
          <p>No videos available. Showing fallback.</p>
        </div>
      )}
    </section>
  );
};

VideoGallery.propTypes = {
  videos: PropTypes.array,
  fallbackVideo: PropTypes.string,
  title: PropTypes.string,
  showHero: PropTypes.bool,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  allowMuteToggle: PropTypes.bool,
  className: PropTypes.string,
  actions: PropTypes.array,
};

export default VideoGallery;
