// src/components/context/MediaCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './MediaCard.css';

const SingleMediaCard = ({ media, fullWidth = false, onClick }) => {
  // ✅ Guard against null/undefined
  const safeMedia = media || {};

  // ✅ Resolve image/video sources with fallbacks
  const thumbnail =
    safeMedia?.url?.thumbnail ||
    safeMedia?.url?.medium ||
    safeMedia?.url?.full ||
    '/mock/banner-1.png'; // fallback image

  const fullUrl =
    safeMedia?.url?.full ||
    (safeMedia?.file_type?.toLowerCase().includes('video')
      ? '/mock/hero-video.mp4' // fallback video
      : thumbnail);

  // ✅ Detect type safely
  const isVideo = safeMedia?.file_type?.toLowerCase().includes('video');

  // ✅ Label fallback
  const label =
    safeMedia?.label ||
    safeMedia?.title ||
    safeMedia?.category ||
    'Media Item';

  // ✅ Category (for grouping/styling)
  const category = safeMedia?.category || 'general';

  // Error handlers with correct fallback assets
  const handleVideoError = (e) => {
    e.target.poster = '/mock/banner-1.png';
    if (e.target.querySelector('source')) {
      e.target.querySelector('source').src = '/mock/hero-video.mp4';
      e.target.load();
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/mock/banner-1.png';
  };

  return (
    <div
      className={`media-card ${fullWidth ? 'full' : ''}`}
      data-category={category}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="media-thumb-wrapper">
        {isVideo ? (
          <>
            <video
              className="media-thumb"
              muted
              preload="metadata"
              poster={thumbnail} // ✅ fallback poster
              onError={handleVideoError}
            >
              <source src={fullUrl} type={safeMedia.file_type || 'video/mp4'} />
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

// ✅ PropTypes for maintainability
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

export default SingleMediaCard;
