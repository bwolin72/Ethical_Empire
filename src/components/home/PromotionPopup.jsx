import React, { useEffect, useState } from 'react';
import publicAxios from '../../api/publicAxios'; // make sure this has your backend base URL configured
import './PromotionPopup.css';

const BACKEND_BASE_URL = 'https://ethical-backend-production.up.railway.app'; // your backend base URL

const PromotionPopup = () => {
  const [promotion, setPromotion] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await publicAxios.get('/promotions/active/');
        if (response.data.length > 0) {
          const promo = response.data[0];

          // Fix media URLs
          if (promo.image && !promo.image.startsWith('http')) {
            promo.image = `${BACKEND_BASE_URL}${promo.image.startsWith('/') ? '' : '/'}${promo.image}`;
          }
          if (promo.video && !promo.video.startsWith('http')) {
            promo.video = `${BACKEND_BASE_URL}${promo.video.startsWith('/') ? '' : '/'}${promo.video}`;
          }

          setPromotion(promo);
        }
      } catch (err) {
        console.error('Failed to load promotion', err);
      }
    };

    fetchPromotions();

    const timer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!promotion || !visible) return null;

  return (
    <div className="promotion-popup">
      <div className="promotion-content">
        <button className="close-button" onClick={handleClose}>×</button>
        <h3>{promotion.title}</h3>

        {/* Render media if available */}
        {promotion.image && (
          <img src={promotion.image} alt={promotion.title} className="promo-image" />
        )}
        {promotion.video && (
          <video controls className="promo-video">
            <source src={promotion.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Render HTML content */}
        <div
          className="promo-html"
          dangerouslySetInnerHTML={{ __html: promotion.html_content }}
        />
      </div>
    </div>
  );
};

export default PromotionPopup;
