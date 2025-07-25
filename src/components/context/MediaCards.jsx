// src/components/context/MediaCards.jsx

import React, { useState } from 'react';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import MediaCard from './MediaCard';
import MediaSkeleton from './MediaSkeleton';
import './MediaCard.css';

/**
 * Displays a scrollable list of media or banner cards.
 *
 * @param {Object} props
 * @param {string} props.endpoint - The endpoint this media belongs to (required for media type)
 * @param {'media'|'banner'} [props.type='media'] - Type of content
 * @param {string} [props.title] - Optional title heading
 * @param {boolean} [props.fullWidth=false] - Whether the scroll container spans full width
 * @param {boolean|null} [props.isActive=true] - Filter by active status
 * @param {boolean} [props.isFeatured=false] - Whether to show only featured items
 * @param {string} [props.fileType] - Optional MIME filter like 'image/', 'video/'
 * @param {string} [props.labelQuery] - Optional search keyword for label
 */
const MediaCards = ({
  endpoint,
  type = 'media',
  title,
  fullWidth = false,
  isActive = true,
  isFeatured = false,
  fileType = '',
  labelQuery = '',
}) => {
  const [previewMedia, setPreviewMedia] = useState(null);

  const {
    media: mediaItems,
    loading,
    error,
  } = useMediaFetcher({
    type,
    endpoint,
    isActive,
    isFeatured,
    autoFetch: true,
    pageSize: 20,
    fileType,
    labelQuery,
  });

  console.log('📦 MediaCards fetch debug:', {
    type,
    endpoint,
    isActive,
    isFeatured,
    fileType,
    labelQuery,
    mediaCount: mediaItems.length,
  });

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}

      <div className={`media-cards-scroll-wrapper ${fullWidth ? 'full' : ''}`}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="media-card-wrapper">
              <MediaSkeleton />
            </div>
          ))
        ) : error ? (
          <p className="media-error">{error}</p>
        ) : mediaItems.length === 0 ? (
          <p className="media-card-empty">
            📭 No media uploaded{endpoint ? ` for ${endpoint}` : ''}.
          </p>
        ) : (
          mediaItems.map((media) => (
            <div
              key={media.id || media.url?.full || media.label}
              className="media-card-wrapper"
              onClick={() => setPreviewMedia(media)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPreviewMedia(media)}
            >
              <MediaCard media={media} fullWidth={fullWidth} />
            </div>
          ))
        )}
      </div>

      {/* === Modal Preview === */}
      {previewMedia && (
        <div className="media-modal" onClick={() => setPreviewMedia(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setPreviewMedia(null)}>✖</button>
            <img
              src={previewMedia.url?.full}
              alt={previewMedia.label || 'Media Preview'}
              className="modal-media-image"
              onError={(e) => (e.target.src = '/placeholder.jpg')}
            />
            <p className="modal-media-caption">{previewMedia.label}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaCards;
