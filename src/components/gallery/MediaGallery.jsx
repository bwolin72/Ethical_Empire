// src/components/gallery/MediaGallery.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./MediaGallery.css";
import placeholderImg from "../../assets/placeholder.jpg";

const MediaGallery = ({ items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalItem, setModalItem] = useState(null);

  // Auto-rotate grid every 5s
  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 4) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  const visibleItems = items.slice(currentIndex, currentIndex + 4);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 4 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 4) % items.length);
  }, [items.length]);

  return (
    <div className="gallery-container">
      <div className="gallery-controls">
        <button onClick={handlePrev} aria-label="Previous" className="gallery-nav-btn">◀</button>
        <button onClick={handleNext} aria-label="Next" className="gallery-nav-btn">▶</button>
      </div>

      <div className="gallery-grid">
        {visibleItems.map((item) => (
          <motion.div
            key={item.id}
            className="gallery-card"
            whileHover={{ scale: 1.05 }}
            onClick={() => setModalItem(item)}
          >
            {item.type === "image" ? (
              <img
                src={item.url || placeholderImg}
                alt={item.title}
                className="gallery-img"
                loading="lazy"
              />
            ) : (
              <video
                src={item.url}
                poster={item.poster || placeholderImg}
                className="gallery-video"
                muted
                preload="metadata"
                playsInline
              />
            )}
            {item.title && <div className="gallery-caption">{item.title}</div>}
          </motion.div>
        ))}
      </div>

      {/* Modal Preview */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            className="gallery-modal"
            onClick={() => setModalItem(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="gallery-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="close-button"
                onClick={() => setModalItem(null)}
                aria-label="Close preview"
              >
                ✖
              </button>
              {modalItem.type === "image" ? (
                <img src={modalItem.url || placeholderImg} alt={modalItem.title} />
              ) : (
                <video
                  src={modalItem.url}
                  controls
                  autoPlay
                  poster={modalItem.poster || placeholderImg}
                />
              )}
              {modalItem.title && <p className="modal-caption">{modalItem.title}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;
