import React from 'react';
import './MediaCard.css';

const MediaCard = ({ media, fullWidth = false }) => {
  if (!media || !media.url) {
    return null; // skip rendering if media is undefined or malformed
  }

  const url = media.url;
  const ext = url?.split('.').pop().toLowerCase();

  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);

  return (
    <div className={`media-card-wrapper ${fullWidth ? 'full-width' : ''}`}>
      {isVideo ? (
        <video src={url} controls className="media-preview" />
      ) : isImage ? (
        <img src={url} alt="media" className="media-preview" />
      ) : (
        <div className="media-preview fallback">
          <p>Unsupported file type</p>
          <a href={url} target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
