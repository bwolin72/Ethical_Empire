// src/components/context/MediaCards.jsx

import React from 'react';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import MediaCard from './MediaCards';
import MediaSkeleton from './MediaSkeleton';
import './MediaCard.css';

const MediaCards = ({ endpoint, type = 'media', title, fullWidth = false }) => {
  const {
    media: mediaItems,
    loading,
    error,
  } = useMediaFetcher({
    type,
    endpoint,
    isActive: true,
    autoFetch: true,
    pageSize: 20,
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
            📭 No media uploaded yet for <strong>{endpoint}</strong>.
          </p>
        ) : (
          mediaItems.map((media) => (
            <div key={`media-${media.id ?? media.url?.full ?? Math.random()}`} className="media-card-wrapper">
              <MediaCard media={media} fullWidth={fullWidth} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default MediaCards;
