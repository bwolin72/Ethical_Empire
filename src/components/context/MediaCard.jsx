import React, { useState } from 'react';
import './MediaCard.css';

const fallbackImage = '/fallback-image.jpg'; // make sure this exists in your public/ folder
const fallbackVideo = '/fallback-video.mp4'; // optional fallback video

const MediaCard = ({ media, fullWidth = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!media || !media.url) return null;

  const fullUrl = media.url.full;
  const thumbUrl = media.url.thumb || fullUrl; // fallback to full if no thumb

  const ext = fullUrl?.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <div className={`media-card-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {loading && (
        <div className="media-skeleton">
          <div className="skeleton-box" />
        </div>
      )}

      {!error ? (
        isVideo ? (
          <video
            src={fullUrl}
            controls
            onCanPlay={handleLoad}
            onError={handleError}
            className={`media-preview video ${loading ? 'hidden' : ''}`}
            preload="metadata"
          />
        ) : isImage ? (
          <img
            src={thumbUrl}
            data-full={fullUrl}
            alt={media.label || 'media'}
            onLoad={handleLoad}
            onError={handleError}
            className={`media-preview image ${loading ? 'hidden' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="media-preview fallback">
            <p>Unsupported media type</p>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">View File</a>
          </div>
        )
      ) : (
        isVideo ? (
          <video src={fallbackVideo} controls className="media-preview video fallback" />
        ) : (
          <img src={fallbackImage} alt="fallback" className="media-preview image fallback" />
        )
      )}

      {media.label && <p className="media-caption">{media.label}</p>}
    </div>
  );
};

export default MediaCard;
