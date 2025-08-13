import React from 'react';
import PropTypes from 'prop-types';
import './MediaCard.css';

const SingleMediaCard = ({ media, fullWidth = false, onClick = null }) => {
  // Ensure we always have a media object
  const safeMedia = media || {};

  // Extract URLs
  const thumbnail =
    safeMedia?.url?.thumbnail ||
    safeMedia?.url?.medium ||
    safeMedia?.url?.full ||
    '/placeholder.jpg';

  const fullUrl = safeMedia?.url?.full || thumbnail;

  // Determine type
  const isVideo = safeMedia?.file_type?.includes('video');

  // Label fallback
  const label =
    safeMedia?.label ||
    safeMedia?.title ||
    safeMedia?.category ||
    'Media Item';

  // Category (used for grouping banners/home/about/etc.)
  const category = safeMedia?.category || 'general';

  // Handle video load errors
  const handleVideoError = (e) => {
    e.target.poster = '/placeholder.jpg';
  };

  // Handle image load errors
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
              onError={handleVideoError}
            >
              <source src={fullUrl} type={safeMedia.file_type} />
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

// PropTypes for better maintainability
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
