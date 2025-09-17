import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";

// Medium components
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import VideoGallery from "../videos/VideoGallery";

// Centralised API access
import useFetcher from "../../hooks/useFetcher";
import { API_ENDPOINTS } from "../../api/apiService";

import "./EethmHome.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const EethmHome = () => {
  const navigate = useNavigate();
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // ✅ Centralised data fetching
  const {
    data: videos = [],
    loading: videosLoading,
    error: videosError,
  } = useFetcher(API_ENDPOINTS.videos);

  const {
    data: promotions = [],
    loading: promoLoading,
    error: promoError,
  } = useFetcher(API_ENDPOINTS.promotions);

  const {
    data: reviews = [],
    loading: reviewLoading,
    error: reviewError,
  } = useFetcher(API_ENDPOINTS.reviews);

  const {
    data: media = [],
    loading: mediaLoading,
    error: mediaError,
  } = useFetcher(API_ENDPOINTS.media);

  // ✅ Hero section uses the first video or a local fallback
  const heroVideo = videos.length ? videos[0] : { url: LOCAL_FALLBACK_VIDEO };

  // ✅ Gallery shows all videos + media, or a local fallback image
  const galleryItems =
    [...videos, ...media].length > 0
      ? [...videos, ...media]
      : [{ url: LOCAL_FALLBACK_IMAGE }];

  return (
    <div className="eethm-home-page">
      {/* ===== HERO VIDEO SECTION ===== */}
      <section className="video-hero-section">
        <VideoGallery
          videos={[heroVideo]}
          fallbackVideo={LOCAL_FALLBACK_VIDEO}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Ethical Multimedia GH"
          subtitle="Live Band • Catering • Multimedia • Decor Services"
          actions={[
            {
              label: "Book Now",
              onClick: () => navigate("/bookings"),
              className: "btn-primary",
            },
            {
              label: "📩 Subscribe",
              onClick: () => setShowNewsletterForm(true),
              className: "btn-secondary",
            },
          ]}
        />
      </section>

      {/* ===== HIGHLIGHT BANNERS ===== */}
      <FadeInSection>
        <section className="banners-hero-wrap">
          <BannerCards endpointKey="banners" title="Highlights" type="banner" />
        </section>
      </FadeInSection>

      {/* ===== SERVICES ===== */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* ===== PROMOTIONS ===== */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Special Offers</h2>
          {promoLoading ? (
            <p>Loading promotions…</p>
          ) : promotions.length ? (
            <div className="promotions-grid">
              {promotions.map((p, idx) => (
                <article
                  key={p.id ?? `promo-${idx}`}
                  className="promotion-card"
                >
                  {p.image_url && <img src={p.image_url} alt={p.title} />}
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    {p.discount_percentage && (
                      <p>Save {p.discount_percentage}%</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : promoError ? (
            <p className="error-text">{promoError}</p>
          ) : (
            <p className="muted-text">No promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* ===== MEDIA LIBRARY ===== */}
      <FadeInSection>
        <section className="media-library-section">
          <h2>Our Media Library</h2>
          {mediaLoading && <p>Loading media…</p>}
          {mediaError && <p className="error-text">{mediaError}</p>}
          <MediaCards
            endpointKey="media"
            resourceType="media"
            fullWidth={false}
            isActive
            isFeatured={false}
          />
        </section>
      </FadeInSection>

      {/* ===== GALLERY SHOWCASE ===== */}
      <FadeInSection>
        <section className="media-gallery-section">
          <h2>Gallery Showcase</h2>
          {videosError && <p className="error-text">{videosError}</p>}
          <MediaGallery items={galleryItems} />
        </section>
      </FadeInSection>

      {/* ===== CLIENT REVIEWS ===== */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviewLoading ? (
            <p>Loading reviews…</p>
          ) : reviews.length ? (
            <div className="reviews-container">
              {reviews.map((r, idx) => (
                <div
                  key={r.id ?? `review-${idx}`}
                  className="review-card"
                >
                  <p>"{r.comment}"</p>
                  <p>— {r.name || "Anonymous"}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p className="error-text">{reviewError}</p>
          ) : (
            <p className="muted-text">No reviews.</p>
          )}
        </section>
      </FadeInSection>

      {/* ===== NEWSLETTER MODAL ===== */}
      {showNewsletterForm && (
        <div
          className="newsletter-modal-backdrop"
          onClick={() => setShowNewsletterForm(false)}
        >
          <div
            className="newsletter-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button
              className="newsletter-close-btn"
              onClick={() => setShowNewsletterForm(false)}
              type="button"
            >
              &times;
            </button>
            <NewsletterSignup />
          </div>
        </div>
      )}
    </div>
  );
};

export default EethmHome;
