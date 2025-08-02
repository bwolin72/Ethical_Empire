import React from 'react';
import './MediaSkeleton.css';

const MediaSkeleton = ({ count = 4 }) => (
  <div className="media-skeleton-scroll">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="media-skeleton-card shimmer" />
    ))}
  </div>
);

export default MediaSkeleton;
