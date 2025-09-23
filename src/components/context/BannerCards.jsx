// src/components/media/BannerCards.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import useFetcher from "../../hooks/useFetcher";
import placeholderImg from "../../assets/placeholder.jpg";
import BannerSkeleton from "./BannerSkeleton";
import "./BannerCards.css";

const BannerCards = ({ endpointKey = "banners", title }) => {
  const [preview, setPreview] = useState(null);
  const scrollRef = useRef(null);

  // Fetch media banners
  const { data: banners = [], loading, error } = useFetcher("media", endpointKey);
  const safeBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];

  // Scroll controls
  const handleScroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setPreview(null);
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Renderer for banner preview
  const renderBannerContent = (banner, isModal = false) => {
    const fileType = banner?.type || banner?.mime || "";

    if (fileType.includes("image")) {
      return (
        <img
          src={banner.url?.full || placeholderImg}
          alt={banner.label || "Banner"}
          className={isModal ? "modal-banner-image" : "banner-card-image"}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = placeholderImg)}
        />
      );
    }

    if (fileType.includes("pdf")) {
      return (
        <object
          data={banner.url?.full}
          type="application/pdf"
          width="100%"
          height={isModal ? "80vh" : "300px"}
        >
          <p>PDF preview not supported. <a href={banner.url?.full}>Download</a></p>
        </object>
      );
    }

    if (fileType.includes("video")) {
      return (
        <video
          controls
          src={banner.url?.full}
          className={isModal ? "modal-banner-video" : "banner-card-video"}
        />
      );
    }

    if (fileType.includes("audio")) {
      return <audio controls src={banner.url?.full} />;
    }

    return (
      <img
        src={placeholderImg}
        alt="Unsupported"
        className={isModal ? "modal-banner-image" : "banner-card-image"}
      />
    );
  };

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}

      {/* Scroll Controls */}
      <div className="scroll-controls">
        <button
          onClick={() => handleScroll("left")}
          className="scroll-btn"
          disabled={loading || safeBanners.length === 0}
          aria-label="Scroll left"
        >
          ◀
        </button>
        <button
          onClick={() => handleScroll("right")}
          className="scroll-btn"
          disabled={loading || safeBanners.length === 0}
          aria-label="Scroll right"
        >
          ▶
        </button>
      </div>

      {/* Cards */}
      <div className="banner-cards-scroll-wrapper" ref={scrollRef} aria-live="polite">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="banner-card"><BannerSkeleton /></div>
          ))
        ) : error ? (
          <div className="banner-error">❌ {error.message || "Failed to load banners"}</div>
        ) : safeBanners.length === 0 ? (
          <p className="banner-card-empty">
            📭 No banners available for <strong>{endpointKey}</strong>.
          </p>
        ) : safeBanners.map((banner, idx) => (
          <div
            key={banner.id || banner.url?.full || banner.label || idx}
            className="banner-card"
            role="button"
            tabIndex={0}
            onClick={() => setPreview(banner)}
            onKeyDown={(e) => e.key === "Enter" && setPreview(banner)}
          >
            <div className="banner-img-wrapper">
              {renderBannerContent(banner)}
              <div className="banner-hover-overlay">
                {banner.label && <p>{banner.label}</p>}
                {banner.uploaded_by && <span>{banner.uploaded_by}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {preview && (
        <div className="banner-modal" onClick={() => setPreview(null)} role="dialog" aria-modal="true">
          <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setPreview(null)} aria-label="Close preview">
              ✖
            </button>
            {renderBannerContent(preview, true)}
            {preview.label && <p className="modal-banner-caption">{preview.label}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerCards;
