import React, { useEffect, useState } from 'react';
import publicAxios from '../../api/publicAxios';
import './PromotionPopup.css'; // Styling file

const PromotionPopup = () => {
  const [promotion, setPromotion] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await publicAxios.get('/promotions/active/');
        if (response.data.length > 0) {
          setPromotion(response.data[0]); // Show the first active promotion
        }
      } catch (err) {
        console.error('Failed to load promotion', err);
      }
    };

    fetchPromotions();

    // Show after a 5-second delay
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
        <p>{promotion.message}</p>
      </div>
    </div>
  );
};

export default PromotionPopup;
