import React, { useState, useRef, useEffect, useCallback } from "react";
import useFetcher from "../../hooks/useFetcher";
import placeholderImg from "../../assets/placeholder.jpg";
import BannerSkeleton from "./BannerSkeleton";
import "./BannerCards.css";

const BannerCards = ({ endpointKey = "all", title }) => {
  const [preview, setPreview] = useState(null);
  const scrollRef = useRef(null);

  const { data: banners = [], loading, error } = useFetcher("media", endpointKey);
  const safeBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];

  const handleScroll = useCallback((dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setPreview(null);
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const renderBannerContent = (banner, isModal = false) => {
    const type = (banner.type || "").toLowerCase();
    const fullUrl = banner.url?.full || placeholderImg;

    if (type.includes("image")) {
      return <img src={fullUrl} alt={banner.label || "Banner"} className={isModal ? "modal-banner-image" : "banner-card-image"} loading="lazy" onError={(e) => (e.currentTarget.src = placeholderImg)} />;
    }

    if (type.includes("video")) {
      return <video controls src={fullUrl} className={isModal ? "modal-banner-video" : "banner-card-video"} poster={banner.url?.thumb || placeholderImg} />;
    }

    if (type.includes("pdf")) {
      return (
        <object data={fullUrl} type="application/pdf" width="100%" height={isModal ? "80vh" : "300px"}>
          <p>PDF preview not supported. <a href={fullUrl}>Download</a></p>
        </object>
      );
    }

    if (type.includes("audio")) {
      return <audio controls src={fullUrl} />;
    }

    return <img src={placeholderImg} alt="Unsupported" className={isModal ? "modal-banner-image" : "banner-card-image"} />;
  };

  return (
    <section className="banner-cards-container">
      {title && <h2 className="banner-cards-title">{title}</h2>}

      <div className="scroll-controls">
        <button onClick={() => handleScroll("left")} className="scroll-btn" disabled={loading || safeBanners.length === 0} aria-label="Scroll left">◀</button>
        <button onClick={() => handleScroll("right")} className="scroll-btn" disabled={loading || safeBanners.length === 0} aria-label="Scroll right">▶</button>
      </div>

      <div className="banner-cards-scroll-wrapper" ref={scrollRef} aria-live="polite">
        {loading ? Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="banner-card"><BannerSkeleton /></div>) :
         error ? <div className="banner-error">❌ {error.message || "Failed to load banners"}</div> :
         safeBanners.length === 0 ? <p className="banner-card-empty">📭 No banners available for <strong>{endpointKey}</strong>.</p> :
         safeBanners.map((banner, idx) => (
          <div key={banner.id || banner.url?.full || banner.label || idx} className="banner-card" role="button" tabIndex={0} onClick={() => setPreview(banner)} onKeyDown={(e) => e.key === "Enter" && setPreview(banner)}>
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

      {preview && (
        <div className="banner-modal" onClick={() => setPreview(null)} role="dialog" aria-modal="true">
          <div className="banner-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setPreview(null)} aria-label="Close preview">✖</button>
            {renderBannerContent(preview, true)}
            {preview.label && <p className="modal-banner-caption">{preview.label}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default BannerCards;
