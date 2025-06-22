import React from 'react';
import './MediaCard.css';

const MediaCard = ({ media, fullWidth = false }) => {
  if (!media || !media.url) return null;

  const url = media.url;
  const ext = url?.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);

  return (
    <div className={`media-card-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {isVideo ? (
        <video src={url} controls className="media-preview video" />
      ) : isImage ? (
        <img src={url} alt={media.title || 'media'} className="media-preview image" />
      ) : (
        <div className="media-preview fallback">
          <p>Unsupported media type</p>
          <a href={url} target="_blank" rel="noopener noreferrer">View File</a>
        </div>
      )}
      {media.title && <p className="media-caption">{media.title}</p>}
    </div>
  );
};

export default MediaCard;
