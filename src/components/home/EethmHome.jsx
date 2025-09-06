// src/components/home/EethmHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";

// Feature components
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import VideoGallery from "../videos/VideoGallery";

import "./EethmHome.css";

// --- Local fallbacks ---
const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";

// --- Helpers ---
const asArray = (res) => {
  if (!res) return [];
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const EethmHome = () => {
  const navigate = useNavigate();

  // API data (videos, media, promotions, reviews)
  const [videos, setVideos] = useState([]);
  const [media, setMedia] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Error states
  const [videosError, setVideosError] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Newsletter modal
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // --- Fetch all ---
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [videoRes, promoRes, reviewRes, mediaRes] = await Promise.allSettled([
          apiService.getVideos(),
          apiService.getPromotions(),
          apiService.getReviews(),
          apiService.getMedia(),
        ]);

        if (!mounted) return;

        if (videoRes.status === "fulfilled") {
          setVideos(asArray(videoRes.value));
        } else {
          setVideos([]);
          setVideosError("Failed to load videos");
        }

        if (promoRes.status === "fulfilled") {
          setPromotions(asArray(promoRes.value));
        } else {
          setPromotions([]);
          setPromoError("Failed to load promotions");
        }

        if (reviewRes.status === "fulfilled") {
          setReviews(asArray(reviewRes.value));
        } else {
          setReviews([]);
          setReviewError("Failed to load reviews");
        }

        if (mediaRes.status === "fulfilled") {
          setMedia(asArray(mediaRes.value));
        } else {
          setMedia([]);
        }
      } catch (err) {
        console.error("❌ Unexpected API fetch error:", err);
        setVideos([]);
        setPromotions([]);
        setReviews([]);
        setMedia([]);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Normalized ---
  const videosArr = Array.isArray(videos) ? videos : [];
  const promosArr = Array.isArray(promotions) ? promotions : [];
  const reviewsArr = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="eethm-home-page">
      {/* === HERO (VideoGallery) === */}
      <section className="video-hero-section">
        <VideoGallery
          videos={videosArr}
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

      {/* === HERO HIGHLIGHTS (BannerCards) === */}
      <FadeInSection>
        <section className="banners-hero-wrap">
          <BannerCards endpointKey="banners" title="Highlights" type="banner" />
        </section>
      </FadeInSection>

      {/* === SERVICES === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* === PROMOTIONS === */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Special Offers</h2>
          {promosArr.length > 0 ? (
            <div className="promotions-grid">
              {promosArr.map((p, idx) => (
                <article key={p.id ?? p.image_url ?? idx} className="promotion-card">
                  {p.image_url && <img src={p.image_url} alt={p.title} />}
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    {p.discount_percentage && <p>Save {p.discount_percentage}%</p>}
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

      {/* === MEDIA LIBRARY (MediaCards) === */}
      <FadeInSection>
        <section className="media-library-section">
          <h2>Our Media Library</h2>
          <MediaCards
            endpointKey="media"
            resourceType="media"
            title={null}
            fullWidth={false}
            isActive={true}
            isFeatured={false}
          />
        </section>
      </FadeInSection>

      {/* === GALLERY SHOWCASE (MediaGallery) === */}
      <FadeInSection>
        <section className="media-gallery-section">
          <h2>Gallery Showcase</h2>
          {videosError && <p className="error-text">{videosError}</p>}
          {videosArr.length > 0 || media.length > 0 ? (
            <MediaGallery items={[...videosArr, ...media]} />
          ) : (
            <p className="muted-text">No highlights to show.</p>
          )}
        </section>
      </FadeInSection>

      {/* === REVIEWS === */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviewsArr.length > 0 ? (
            <div className="reviews-container">
              {reviewsArr.map((r, idx) => (
                <div key={r.id ?? idx} className="review-card">
                  <p>"{r.comment}"</p>
                  <p>— {r.name}</p>
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

      {/* === NEWSLETTER MODAL === */}
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
