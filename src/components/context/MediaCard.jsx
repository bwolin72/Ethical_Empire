import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import MediaCard from './MediaCard';
import './MediaCard.css'; // Optional for layout

const MediaCards = ({ endpoint, title, fullWidth = false }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!endpoint) return;

    const fetchMedia = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/media/', {
          params: {
            type: 'media',
            endpoints__contains: endpoint,
            is_active: true,
          },
        });
        setMediaItems(Array.isArray(res.data?.results) ? res.data.results : []);
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media.');
        setMediaItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [endpoint]);

  if (loading) return <div className="media-loading">Loading media...</div>;
  if (error) return <div className="media-error">{error}</div>;

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}
      <div className={`media-cards-grid ${fullWidth ? 'full' : ''}`}>
        {!Array.isArray(mediaItems) || mediaItems.length === 0 ? (
          <p className="media-card-empty">No media available for this section.</p>
        ) : (
          mediaItems.map((media) => (
            <MediaCard key={media.id || media.url?.full} media={media} fullWidth={fullWidth} />
          ))
        )}
      </div>
    </section>
  );
};

export default MediaCards;
