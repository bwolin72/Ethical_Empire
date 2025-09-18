import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./MediaGallery.css";

const MediaGallery = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalItem, setModalItem] = useState(null);

  // Auto-rotate every 5s
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 4) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  const visibleItems = items.slice(currentIndex, currentIndex + 4);

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {visibleItems.map((item) => (
          <motion.div
            key={item.id || Math.random()}
            className="gallery-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => setModalItem(item)}
          >
            {item.type === "image" ? (
              <img src={item.url} alt={item.title} className="gallery-img" />
            ) : (
              <video src={item.url} className="gallery-video" muted />
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal Preview */}
      {modalItem && (
        <div className="gallery-modal" onClick={() => setModalItem(null)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            {modalItem.type === "image" ? (
              <img src={modalItem.url} alt={modalItem.title} />
            ) : (
              <video src={modalItem.url} controls autoPlay />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
