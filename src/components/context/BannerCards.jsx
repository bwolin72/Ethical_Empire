import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './BannerCards.css';

const BannerCards = ({ endpoint, title }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!endpoint) return;

    const fetchBanners = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/media/banners/', {
          params: { endpoints__contains: endpoint },
        });
        setBanners(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError('Failed to load banners. Please try again.');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [endpoint]);

  if (loading) return <div className="banner-loading">Loading banners...</div>;
  if (error) return <div className="banner-error">{error}</div>;

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}
      <div className="banner-cards-grid">
        {!Array.isArray(banners) || banners.length === 0 ? (
          <p className="banner-card-empty">No banners available for this section.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner.id || banner.url?.full || banner.label} className="banner-card">
              <img
                src={banner.url?.thumb || banner.url?.full}
                alt={banner.label || 'Banner Image'}
                loading="lazy"
                className="banner-card-image"
              />
              <div className="banner-card-info">
                {banner.label && <p className="banner-card-caption">{banner.label}</p>}
                {banner.uploaded_by && (
                  <p className="banner-card-meta">Uploaded by: {banner.uploaded_by}</p>
                )}
                {banner.uploaded_at && (
                  <p className="banner-card-meta">
                    Uploaded at: {new Date(banner.uploaded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BannerCards;
