import React, { useState } from 'react';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import SingleMediaCard from './MediaCard';
import MediaSkeleton from './MediaSkeleton';
import './MediaCard.css';

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

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}

      <div className={`media-cards-scroll-wrapper ${fullWidth ? 'full' : ''}`}>
        {loading ? (
          <MediaSkeleton count={3} />
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
              <SingleMediaCard media={media} fullWidth={fullWidth} />
            </div>
          ))
        )}
      </div>

      {previewMedia && (
        <div className="media-modal" onClick={() => setPreviewMedia(null)}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setPreviewMedia(null)}>✖</button>
            {previewMedia.file_type?.includes('video') ? (
              <video
                src={previewMedia.url?.full}
                controls
                className="modal-media-content"
              />
            ) : (
              <img
                src={previewMedia.url?.full}
                alt={previewMedia.label || 'Preview'}
                className="modal-media-content"
                onError={(e) => (e.target.src = '/placeholder.jpg')}
              />
            )}
            <p className="modal-media-caption">{previewMedia.label}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default MediaCards;
