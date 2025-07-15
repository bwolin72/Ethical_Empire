import React, { useState } from 'react';
import './MediaCard.css';

const fallbackImage = '/fallback-image.jpg'; // Place in public/
const fallbackVideo = '/fallback-video.mp4'; // Optional, place in public/

const MediaCard = ({ media, fullWidth = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!media || !media.url || !media.url.full) return null;

  const fullUrl = media.url.full;
  const thumbUrl = media.url.thumb || fullUrl;

  const extension = fullUrl?.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const renderMedia = () => {
    if (error) {
      return isVideo ? (
        <video
          src={fallbackVideo}
          controls
          className="media-preview video fallback"
          aria-label="Fallback video"
        />
      ) : (
        <img
          src={fallbackImage}
          alt="Fallback media"
          className="media-preview image fallback"
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={fullUrl}
          controls
          preload="metadata"
          className={`media-preview video ${loading ? 'hidden' : ''}`}
          onCanPlay={handleLoad}
          onError={handleError}
          aria-label={media.label || 'Video'}
        />
      );
    }

    if (isImage) {
      return (
        <img
          src={thumbUrl}
          alt={media.label || 'Image'}
          data-full={fullUrl}
          onLoad={handleLoad}
          onError={handleError}
          className={`media-preview image ${loading ? 'hidden' : ''}`}
          loading="lazy"
        />
      );
    }

    return (
      <div className="media-preview fallback">
        <p>Unsupported media type</p>
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">View File</a>
      </div>
    );
  };

  return (
    <div className={`media-card-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {loading && (
        <div className="media-skeleton">
          <div className="skeleton-box" />
        </div>
      )}

      {renderMedia()}

      <div className="media-card-meta">
        {media.label && <p className="media-caption">{media.label}</p>}
        {media.uploaded_by && (
          <p className="media-meta">Uploaded by: {media.uploaded_by}</p>
        )}
        {media.uploaded_at && (
          <p className="media-meta">
            Uploaded at: {new Date(media.uploaded_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default MediaCard;
