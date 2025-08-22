// src/components/context/BannerCards.jsx
import React, { useState, useRef, useEffect } from "react";
import useFetcher from "../../hooks/useFetcher"; // ✅ corrected import
import placeholderImg from "../../assets/placeholder.jpg";
import BannerSkeleton from "./BannerSkeleton";
import "./BannerCards.css";

const BannerCards = ({ endpointKey = "banners", title, type = "banner" }) => {
  const [previewBanner, setPreviewBanner] = useState(null);
  const scrollRef = useRef(null);

  // ✅ Fetch banners using useFetcher
  const { data, loading, error } = useFetcher("media", endpointKey);

  // Always normalize to array
  const banners = Array.isArray(data) ? data : [];

  // === Scroll controls ===
  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });

  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  // === Close modal on Escape ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewBanner(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="banner-cards-container">
      {/* Optional Title */}
      {title && <h2 className="banner-cards-title">{title}</h2>}

      {/* Scroll Buttons */}
      <div className="scroll-controls">
        <button onClick={scrollLeft} className="scroll-btn left">
          ◀
        </button>
        <button onClick={scrollRight} className="scroll-btn right">
          ▶
        </button>
      </div>

      {/* Cards Wrapper */}
      <div className="banner-cards-scroll-wrapper" ref={scrollRef}>
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="banner-card">
              <BannerSkeleton />
            </div>
          ))
        ) : error ? (
          <div className="banner-error">
            ❌ {error.message || "Failed to load banners"}
          </div>
        ) : banners.length === 0 ? (
          <p className="banner-card-empty">
            📭 No {type}s available for <strong>{endpointKey}</strong>.
          </p>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id || banner.url?.full || banner.label}
              className="banner-card"
              onClick={() => setPreviewBanner(banner)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setPreviewBanner(banner)}
            >
              <div className="banner-img-wrapper">
                <img
                  src={banner.url?.thumb || banner.url?.full || placeholderImg}
                  alt={banner.label || `${type} Image`}
                  loading="lazy"
                  className="banner-card-image"
                  onError={(e) => (e.target.src = placeholderImg)}
                />
                <div className="banner-hover-overlay">
                  {banner.label && <p>{banner.label}</p>}
                  {banner.uploaded_by && <span>{banner.uploaded_by}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* === Modal Preview === */}
      {previewBanner && (
        <div className="banner-modal" onClick={() => setPreviewBanner(null)}>
          <div
            className="banner-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setPreviewBanner(null)}
            >
              ✖
            </button>
            <img
              src={previewBanner.url?.full || placeholderImg}
              alt={previewBanner.label || "Preview"}
              className="modal-banner-image"
              onError={(e) => (e.target.src = placeholderImg)}
            />
            {previewBanner.label && (
              <p className="modal-banner-caption">{previewBanner.label}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerCards;
