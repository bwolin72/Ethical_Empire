// src/components/context/MediaCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './MediaCard.css';

const SingleMediaCard = ({ media, fullWidth = false, onClick }) => {
  // Always guard against null/undefined media
  const safeMedia = media || {};

  // ✅ Auto-resolve image sources with fallbacks
  const thumbnail =
    safeMedia?.url?.thumbnail ||
    safeMedia?.url?.medium ||
    safeMedia?.url?.full ||
    '/placeholder.jpg';

  const fullUrl = safeMedia?.url?.full || thumbnail;

  // ✅ Detect file type
  const isVideo = safeMedia?.file_type?.toLowerCase().includes('video');

  // ✅ Auto-generate label fallback
  const label =
    safeMedia?.label ||
    safeMedia?.title ||
    safeMedia?.category ||
    'Media Item';

  // ✅ Categorization for styling/grouping
  const category = safeMedia?.category || 'general';

  // Error handlers
  const handleVideoError = (e) => {
    e.target.poster = '/placeholder.jpg';
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder.jpg';
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
              poster={thumbnail}  // ✅ fallback thumbnail
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
