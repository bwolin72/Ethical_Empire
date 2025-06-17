import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './BannerCards.css';

const BannerCards = ({ endpoint, title }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    if (!endpoint) return;

    axiosInstance
      .get(`/api/media/all/media?endpoint=${endpoint}`)
      .then((res) => setBanners(res.data))
      .catch(console.error);
  }, [endpoint]);

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}
      <div className="banner-cards-grid">
        {banners.map((banner, index) => (
          <div key={index} className="banner-card">
            <img src={banner.url} alt={banner.title || 'Banner Image'} className="banner-card-image" />
            {banner.title && <p className="banner-card-caption">{banner.title}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default BannerCards;
