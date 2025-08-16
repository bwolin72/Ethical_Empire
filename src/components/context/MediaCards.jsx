// src/components/context/MediaCards.jsx

import React, { useState } from 'react';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import SingleMediaCard from './MediaCard';
import MediaSkeleton from './MediaSkeleton';
import placeholderImg from '../../assets/placeholder.jpg';
import './MediaCard.css';

const MediaCards = ({
  endpoint,        // API endpoint override
  type = 'media',  // 'media', 'banner', 'vendor', 'partner'
  title,
  fullWidth = false,
  isActive = true,
  isFeatured = false,
  fileType = '',
  labelQuery = '',
}) => {
  const [previewMedia, setPreviewMedia] = useState(null);

  // Resolve API endpoint dynamically
  const resolvedEndpoint = (() => {
    switch (type) {
      case 'banner': return endpoint || '/api/banners/';
      case 'vendor': return endpoint || '/api/vendors/';
      case 'partner': return endpoint || '/api/partners/';
      default:       return endpoint || '/api/media/';
    }
  })();

  const {
    media: rawMedia,
    loading,
    error,
  } = useMediaFetcher({
    type,
    endpoint: resolvedEndpoint,
    isActive,
    isFeatured,
    autoFetch: true,
    pageSize: 20,
    fileType,
    labelQuery,
  });

  // ✅ Always normalize mediaItems to an array
  const mediaItems = Array.isArray(rawMedia) ? rawMedia : [];

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}

      <div className={`media-cards-scroll-wrapper ${fullWidth ? 'full' : ''}`}>
        {loading ? (
          <MediaSkeleton count={3} />
        ) : error ? (
          <p className="media-error">⚠️ {error}</p>
        ) : mediaItems.length === 0 ? (
          <p className="media-card-empty">📭 No {type} uploaded.</p>
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
              <SingleMediaCard media={media} fullWidth={fullWidth} />
            </div>
          ))
        )}
      </div>

      {/* === Modal Preview === */}
      {previewMedia && (
        <div className="media-modal" onClick={() => setPreviewMedia(null)}>
          <div
            className="media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setPreviewMedia(null)}
            >
              ✖
            </button>

            {previewMedia.file_type?.includes('video') ? (
              <video
                src={previewMedia.url?.full}
                controls
                className="modal-media-content"
              />
            ) : (
              <img
                src={previewMedia.url?.full || placeholderImg}
                alt={previewMedia.label || 'Preview'}
                className="modal-media-content"
                onError={(e) => (e.target.src = placeholderImg)}
              />
            )}

            {previewMedia.label && (
              <p className="modal-media-caption">{previewMedia.label}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaCards;
