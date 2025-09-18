import React from "react";
import PropTypes from "prop-types";
import placeholderImg from "../../assets/placeholder.jpg";
import "./MediaCard.css";

const SingleMediaCard = ({ media = {}, fullWidth = false, onClick }) => {
  const thumbnail =
    media.url?.thumbnail || media.url?.medium || media.url?.full || placeholderImg;

  const fullUrl =
    media.url?.full ||
    (media.file_type?.toLowerCase().includes("video")
      ? "/mock/hero-video.mp4"
      : thumbnail);

  const isVideo = media.file_type?.toLowerCase().includes("video");
  const label = media.label || media.title || media.category || "Media Item";
  const category = media.category?.toLowerCase() || "general";

  const handleVideoError = (e) => {
    e.currentTarget.poster = placeholderImg;
    e.currentTarget.src = "/mock/hero-video.mp4";
  };

  const handleImageError = (e) => {
    e.currentTarget.src = placeholderImg;
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
              <source src={fullUrl} type={media.file_type || "video/mp4"} />
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
