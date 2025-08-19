import React, { useEffect, useState } from "react";
import useMediaFetcher from "../../hooks/useMediaFetcher";
import "./PromotionPopup.css";

const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PromotionPopup = () => {
  const { data: promotions } = useMediaFetcher("promotions"); // ✅ streamlined
  const [promotion, setPromotion] = useState(null);
  const [visible, setVisible] = useState(false);

  // ✅ Normalize media URLs
  useEffect(() => {
    if (Array.isArray(promotions) && promotions.length > 0) {
      const promo = { ...promotions[0] };

      if (promo.image && !promo.image.startsWith("https://")) {
        promo.image = `${BACKEND_BASE_URL}${
          promo.image.startsWith("/") ? "" : "/"
        }${promo.image}`;
      }

      if (promo.video && !promo.video.startsWith("https://")) {
        promo.video = `${BACKEND_BASE_URL}${
          promo.video.startsWith("/") ? "" : "/"
        }${promo.video}`;
      }

      setPromotion(promo);
    }
  }, [promotions]);

  // ✅ Delay popup appearance
  useEffect(() => {
    if (promotion) {
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

          {/* ✅ Image */}
          {promotion.image && (
            <img
              src={promotion.image}
              alt={promotion.title}
              className="promo-image"
            />
          )}

          {/* ✅ Video */}
          {promotion.video && (
            <video controls className="promo-video">
              <source src={promotion.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* ✅ Rendered HTML */}
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
