// src/components/context/BannerCards.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import useFetcher from "../../hooks/useFetcher";
import placeholderImg from "../../assets/placeholder.jpg";
import BannerSkeleton from "./BannerSkeleton";
import "./BannerCards.css";

const BannerCards = ({ endpointKey = "banners", title }) => {
  const [previewBanner, setPreviewBanner] = useState(null);
  const scrollRef = useRef(null);

  // Fetch banners
  const { data: banners = [], loading, error } = useFetcher("media", endpointKey);

  // Scroll controls
  const handleScroll = useCallback((direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && setPreviewBanner(null);
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const safeBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}

      {/* Scroll Controls */}
      <div className="scroll-controls">
        <button
          onClick={() => handleScroll("left")}
          className="scroll-btn left"
          aria-label="Scroll left"
          disabled={loading || safeBanners.length === 0}
        >
          ◀
        </button>
        <button
          onClick={() => handleScroll("right")}
          className="scroll-btn right"
          aria-label="Scroll right"
          disabled={loading || safeBanners.length === 0}
        >
          ▶
        </button>
      </div>

      {/* Cards */}
      <div className="banner-cards-scroll-wrapper" ref={scrollRef} aria-live="polite">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="banner-card">
              <BannerSkeleton />
            </div>
          ))
        ) : error ? (
          <div className="banner-error">❌ {error.message || "Failed to load banners"}</div>
        ) : safeBanners.length === 0 ? (
          <p className="banner-card-empty">
            📭 No banners available for <strong>{endpointKey}</strong>.
          </p>
        ) : (
          safeBanners.map((banner, idx) => (
            <div
              key={banner.id || banner.url?.full || banner.label || idx}
              className="banner-card"
              role="button"
              tabIndex={0}
              onClick={() => setPreviewBanner(banner)}
              onKeyDown={(e) => e.key === "Enter" && setPreviewBanner(banner)}
            >
              <div className="banner-img-wrapper">
                <img
                  src={banner.url?.thumb || banner.url?.full || placeholderImg}
                  alt={banner.label || "Banner"}
                  loading="lazy"
                  className="banner-card-image"
                  onError={(e) => (e.currentTarget.src = placeholderImg)}
                />
                <div className="banner-hover-overlay">
                  {banner.label && <p>{banner.label}</p>}
                  {banner.uploaded_by && <span>{banner.uploaded_by}</span>}
                </div>
              </div>

              <div className="banner-card-info">
                {banner.label && <p className="banner-card-caption">{banner.label}</p>}
                {banner.uploaded_by && <p className="banner-card-meta">Uploaded by {banner.uploaded_by}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {previewBanner && (
        <div
          className="banner-modal"
          onClick={() => setPreviewBanner(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setPreviewBanner(null)}
              aria-label="Close preview"
            >
              ✖
            </button>
            <img
              src={previewBanner?.url?.full || placeholderImg}
              alt={previewBanner?.label || "Preview"}
              className="modal-banner-image"
              onError={(e) => (e.currentTarget.src = placeholderImg)}
            />
            {previewBanner?.label && (
              <p className="modal-banner-caption">{previewBanner.label}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerCards;
