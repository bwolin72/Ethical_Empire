// src/components/promotions/PromotionPopup.jsx
import React, { useEffect, useState } from "react";
import useMediaFetcher from "../../hooks/useMediaFetcher";
import "./PromotionPopup.css";

const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PromotionPopup = () => {
  const { data: promotions, error, loading } = useMediaFetcher("promotions");
  const [promotion, setPromotion] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Array.isArray(promotions) && promotions.length > 0) {
      const promo = { ...promotions[0] };

      // 🔗 Normalize image URL
      if (promo.image && !promo.image.startsWith("http")) {
        promo.image = `${BACKEND_BASE_URL}${promo.image.startsWith("/") ? "" : "/"}${promo.image}`;
      }

      // 🔗 Normalize video URL
      if (promo.video && !promo.video.startsWith("http")) {
        promo.video = `${BACKEND_BASE_URL}${promo.video.startsWith("/") ? "" : "/"}${promo.video}`;
      }

      setPromotion(promo);
    }
  }, [promotions]);

  useEffect(() => {
    if (promotion) {
      // Show popup after 5s delay
      const timer = setTimeout(() => setVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [promotion]);

  const handleClose = () => setVisible(false);

  if (!promotion || !visible) return null;

  return (
    <div className="promotion-popup-overlay">
      <div className="promotion-popup">
        <div className="promotion-content">
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
          <h3>{promotion.title}</h3>

          {promotion.image && (
            <img
              src={promotion.image}
              alt={promotion.title}
              className="promo-image"
            />
          )}
          {promotion.video && (
            <video controls className="promo-video">
              <source src={promotion.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {promotion.html_content && (
            <div
              className="promo-html"
              dangerouslySetInnerHTML={{ __html: promotion.html_content }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionPopup;
