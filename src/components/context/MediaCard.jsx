import React from 'react';
import './MediaCard.css';

const SingleMediaCard = ({ media, fullWidth = false, onClick = null }) => {
  const thumbnail = media?.url?.thumbnail || media?.url?.full || '';
  const isVideo = media?.file_type?.includes('video');
  const label = media?.label || 'Media';

  const handleVideoError = (e) => {
    e.target.poster = '/placeholder.jpg';
  };

  return (
    <div
      className={`media-card ${fullWidth ? 'full' : ''}`}
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
              <source src={media.url?.full} type={media.file_type} />
              Your browser does not support the video tag.
            </video>
            <span className="video-icon">📹</span>
          </>
        ) : (
          <img
            src={thumbnail}
            alt={label}
            className="media-thumb"
            onError={(e) => (e.target.src = '/placeholder.jpg')}
            loading="lazy"
          />
        )}
      </div>
      <div className="media-label">{label}</div>
    </div>
  );
};

export default SingleMediaCard;
