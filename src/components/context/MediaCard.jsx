import React from "react";
import PropTypes from "prop-types";
import "./MediaCard.css";

const SingleMediaCard = ({ media, fullWidth = false, onClick }) => {
  const safeMedia = media || {};

  // Resolve sources
  const thumbnail =
    safeMedia.url?.thumbnail ||
    safeMedia.url?.medium ||
    safeMedia.url?.full ||
    "/mock/banner-1.png";

  const fullUrl =
    safeMedia.url?.full ||
    (safeMedia.file_type?.toLowerCase().includes("video")
      ? "/mock/hero-video.mp4"
      : thumbnail);

  const isVideo = safeMedia.file_type?.toLowerCase().includes("video");

  const label =
    safeMedia.label ||
    safeMedia.title ||
    safeMedia.category ||
    "Media Item";

  const category = safeMedia.category?.toLowerCase() || "general";

  const handleVideoError = (e) => {
    e.currentTarget.poster = "/mock/banner-1.png";
    e.currentTarget.src = "/mock/hero-video.mp4";
  };

  const handleImageError = (e) => {
    e.currentTarget.src = "/mock/banner-1.png";
  };

  return (
    <div
      className={`media-card ${fullWidth ? "full" : ""}`}
      data-category={category}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="media-thumb-wrapper">
        {isVideo ? (
          <>
            <video
              className="media-thumb"
              muted
              preload="metadata"
              poster={thumbnail}
              onError={handleVideoError}
            >
              <source src={fullUrl} type={safeMedia.file_type || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
            <span className="video-icon">📹</span>
          </>
        ) : (
          <img
            src={thumbnail}
            alt={label}
            className="media-thumb"
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>
      <div className="media-label">{label}</div>
    </div>
  );
};

SingleMediaCard.propTypes = {
  media: PropTypes.shape({
    url: PropTypes.shape({
      thumbnail: PropTypes.string,
      medium: PropTypes.string,
      full: PropTypes.string,
    }),
    file_type: PropTypes.string,
    label: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
  }),
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(SingleMediaCard);
