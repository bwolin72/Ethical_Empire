import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './BannerCards.css';

const BannerCards = ({ endpoint, title }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!endpoint) return;

    const fetchBanners = async () => {
      try {
        const res = await axiosInstance.get(`/service_app/media/?endpoint=${endpoint}`);
        setBanners(res.data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [endpoint]);

  if (loading) return <div className="banner-loading">Loading banners...</div>;

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}
      <div className="banner-cards-grid">
        {banners.length === 0 ? (
          <p className="banner-card-empty">No banners available.</p>
        ) : (
          banners.map((banner, index) => (
            <div key={index} className="banner-card">
              <img
                src={banner.url}
                alt={banner.title || `Banner ${index + 1}`}
                className="banner-card-image"
              />
              {banner.title && <p className="banner-card-caption">{banner.title}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BannerCards;
