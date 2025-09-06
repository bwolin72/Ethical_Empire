// src/components/context/PromotionPopup.jsx
import React, { useEffect, useState } from "react";
import useFetcher from "../../hooks/useFetcher"; // ✅ fixed import
import placeholderImg from "../../assets/placeholder.jpg"; // ✅ fallback
import "./PromotionPopup.css";

const BACKEND_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PromotionPopup = () => {
  const { data: promotions } = useFetcher("promotions"); // ✅ streamlined
  const [promotion, setPromotion] = useState(null);
  const [visible, setVisible] = useState(false);

  // ✅ Normalize URLs
  useEffect(() => {
    if (Array.isArray(promotions) && promotions.length > 0) {
      const promo = { ...promotions[0] };

      const normalizeUrl = (url) => {
        if (url && !/^https?:\/\//i.test(url)) {
          return `${BACKEND_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
        }
        return url;
      };

      promo.image = normalizeUrl(promo.image);
      promo.video = normalizeUrl(promo.video);

      setPromotion(promo);
    }
  }, [promotions]);

  // ✅ Delay popup
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

          {promotion.title && <h3>{promotion.title}</h3>}

          {/* ✅ Image */}
          {promotion.image && (
            <img
              src={promotion.image}
              alt={promotion.title || "Promotion"}
              className="promo-image"
              onError={(e) => (e.target.src = placeholderImg)} // fallback
            />
          )}

          {/* ✅ Video */}
          {promotion.video && (
            <video controls className="promo-video">
              <source
                src={promotion.video}
                type={`video/${promotion.video.split(".").pop() || "mp4"}`}
              />
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
