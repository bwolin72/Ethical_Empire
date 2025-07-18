import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import MediaCard from './MediaCard';
import './MediaCard.css';

const MediaCards = ({ endpoint, type = 'media', title, fullWidth = false }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!endpoint || !type) return;

    const fetchMedia = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get('/media/', {
          params: {
            type,
            endpoint,
            is_active: true,
          },
        });

        const results = response?.data?.results || response?.data || [];
        if (!Array.isArray(results)) {
          throw new Error('Invalid response format');
        }

        setMediaItems(results);
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media.');
        setMediaItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [endpoint, type]);

  if (loading) return <div className="media-loading">Loading media...</div>;
  if (error) return <div className="media-error">{error}</div>;

  return (
    <section className="media-cards-container">
      {title && <h2 className="media-cards-title">{title}</h2>}
      <div className={`media-cards-grid ${fullWidth ? 'full' : ''}`}>
        {mediaItems.length === 0 ? (
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
