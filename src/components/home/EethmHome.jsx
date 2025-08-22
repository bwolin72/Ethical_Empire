// src/components/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import FadeInSection from "../FadeInSection";
import Services from "./Services"; // ✅ shared Services component
import NewsletterSignup from "../user/NewsLetterSignup"; // ✅ centralized newsletter form
import "./EethmHome.css";

// --- Local fallbacks ---
const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

// --- Helper ---
const getMediaUrl = (media) => {
  if (!media) return "";
  return (
    media?.video_url ||
    media?.file_url ||
    media?.file ||
    media?.url ||
    ""
  );
};

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Video state
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);

  // API data
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [media, setMedia] = useState([]);

  // Error states
  const [videosError, setVideosError] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Newsletter modal state
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // --- Fetch all data (except services, handled by <Services />) ---
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [videoRes, promoRes, reviewRes, bannerRes, mediaRes] =
          await Promise.allSettled([
            apiService.getVideos(),
            apiService.getPromotions(),
            apiService.getReviews(),
            apiService.getBanners(),
            apiService.getMedia(),
          ]);

        if (!mounted) return;

        if (videoRes.status === "fulfilled") {
          setVideos(videoRes.value?.data || []);
        } else {
          setVideosError("Failed to load videos");
        }

        if (promoRes.status === "fulfilled") {
          setPromotions(promoRes.value?.data || []);
        } else {
          setPromoError("Failed to load promotions");
        }

        if (reviewRes.status === "fulfilled") {
          setReviews(reviewRes.value?.data || []);
        } else {
          setReviewError("Failed to load reviews");
        }

        if (bannerRes.status === "fulfilled") {
          setBanners(bannerRes.value?.data || []);
        }

        if (mediaRes.status === "fulfilled") {
          setMedia(mediaRes.value?.data || []);
        }
      } catch (err) {
        console.error("❌ Unexpected API fetch error:", err);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Hero video ---
  const featuredVideo =
    videos.find((v) => v.is_featured) || videos.find((v) => v.is_active);
  const heroVideoUrl = getMediaUrl(featuredVideo) || LOCAL_FALLBACK_VIDEO;

  // --- Mixed media ---
  const mixedMedia = [...videos, ...media].filter((m) => m?.is_active);
  const featuredMedia = mixedMedia.filter((m) => m?.is_featured);

  // --- Sync mute state ---
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => setIsMuted((p) => !p);

  return (
    <div className="eethm-home-page">
      {/* === Hero === */}
      <section className="video-hero-section">
        <video
          ref={videoRef}
          className="background-video"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          poster={LOCAL_FALLBACK_IMAGE}
          onError={() => setVideoLoadFailed(true)}
        >
          <source
            src={!videoLoadFailed ? heroVideoUrl : LOCAL_FALLBACK_VIDEO}
            type="video/mp4"
          />
        </video>

        <div className="overlay-gradient"></div>
        <div className="overlay-content">
          <h1 className="hero-title">Ethical Multimedia GH</h1>
          <p className="hero-subtitle">
            Live Band • Catering • Multimedia • Decor Services
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/bookings")}
              className="btn-primary"
            >
              Book Now
            </button>
            <button
              onClick={() => setShowNewsletterForm(true)}
              className="btn-secondary"
            >
              📩 Subscribe
            </button>
          </div>
        </div>

        <button
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="mute-button"
          onClick={toggleMute}
          type="button"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </section>

      {/* === Newsletter Modal (centralized component) === */}
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
            >
              &times;
            </button>
            <NewsletterSignup /> {/* ✅ use the centralized component */}
          </div>
        </div>
      )}

      {/* === Services === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services /> {/* ✅ Reuses the shared Services component */}
        </section>
      </FadeInSection>

      {/* === Promotions === */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Special Offers</h2>
          {promotions?.length > 0 ? (
            <div className="promotions-grid">
              {promotions.map((p) => (
                <article key={p.id} className="promotion-card">
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
            <p>{promoError}</p>
          ) : (
            <p>No promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Reviews === */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviews?.length > 0 ? (
            <div className="reviews-container">
              {reviews.map((r) => (
                <div key={r.id} className="review-card">
                  <p>"{r.comment}"</p>
                  <p>— {r.name}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p>{reviewError}</p>
          ) : (
            <p>No reviews.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Highlights (Banners) === */}
      <FadeInSection>
        <section className="banners-section">
          <h2>Highlights from Our Services</h2>
          {banners?.length > 0 ? (
            <div className="banners-grid">
              {banners.map((b) => (
                <div key={b.id} className="banner-card">
                  {b.image_url && <img src={b.image_url} alt={b.title} />}
                  <h4>{b.title}</h4>
                </div>
              ))}
            </div>
          ) : (
            <BannerCards endpoint="banners" />
          )}
        </section>
      </FadeInSection>

      {/* === Mixed Media === */}
      <FadeInSection>
        <section className="mixed-media-section">
          <h2>Gallery</h2>
          {videosError && <p className="error-text">{videosError}</p>}
          {mixedMedia.length > 0 ? (
            <div className="mixed-media-grid">
              {mixedMedia.map((m) => {
                const url = getMediaUrl(m);
                return url.endsWith(".mp4") ? (
                  <video key={m.id} src={url} controls />
                ) : (
                  <img key={m.id} src={url} alt={m.title || "media"} />
                );
              })}
            </div>
          ) : (
            <p>No media available.</p>
          )}
        </section>
      </FadeInSection>

      {/* === Featured Media Carousel === */}
      <FadeInSection>
        <section className="featured-media-section">
          <h2>Featured Media</h2>
          {featuredMedia.length > 0 ? (
            <div className="featured-carousel">
              {featuredMedia.map((m) => {
                const url = getMediaUrl(m);
                return url.endsWith(".mp4") ? (
                  <video key={m.id} src={url} controls />
                ) : (
                  <img key={m.id} src={url} alt={m.title || "featured"} />
                );
              })}
            </div>
          ) : (
            <p>No featured media.</p>
          )}
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
