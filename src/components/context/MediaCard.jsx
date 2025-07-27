import React from 'react';
import './MediaCard.css';

/**
 * Renders an individual media card
 *
 * @param {Object} props
 * @param {Object} props.media - The media object
 * @param {boolean} [props.fullWidth=false] - Whether the card spans full width
 */
const SingleMediaCard = ({ media, fullWidth = false }) => {
  const thumbnail = media.url?.thumbnail || media.url?.full || '';
  const isVideo = media.file_type?.includes('video');

  return (
    <div className={`media-card ${fullWidth ? 'full' : ''}`}>
      {isVideo ? (
        <video className="media-thumb" controls>
          <source src={media.url?.full} type={media.file_type} />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={thumbnail}
          alt={media.label || 'Media'}
          className="media-thumb"
          onError={(e) => (e.target.src = '/placeholder.jpg')}
        />
      )}
      <div className="media-label">{media.label}</div>
    </div>
  );
};

export default SingleMediaCard;
