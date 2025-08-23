// src/components/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";
import "./EethmHome.css";

// --- Local fallbacks ---
const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

// --- Helpers ---
const asArray = (res) => {
  // Accepts axios response or raw data and returns a safe array
  if (!res) return [];
  const data = res?.data ?? res; // axios puts payload on `data`
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getMediaUrl = (media) => {
  if (!media) return "";

  // Try a list of common fields; return the first string URL we find
  const candidates = [
    media?.video_url,
    media?.file_url,
    media?.file,
    typeof media?.url === "string" ? media.url : media?.url?.full,
    media?.image_url,
    media?.thumbnail_url,
  ];

  return candidates.find((v) => typeof v === "string" && v.length) || "";
};

const isVideoItem = (item, url) => {
  const t = (item?.file_type || "").toLowerCase();
  if (t.includes("video")) return true;
  return typeof url === "string" && /\.mp4(\?.*)?$/i.test(url);
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

        if (bannerRes.status === "fulfilled") {
          setBanners(asArray(bannerRes.value));
        } else {
          setBanners([]);
        }

        if (mediaRes.status === "fulfilled") {
          setMedia(asArray(mediaRes.value));
        } else {
          setMedia([]);
        }
      } catch (err) {
        console.error("❌ Unexpected API fetch error:", err);
        // Ensure arrays even on unexpected failures
        setVideos([]);
        setPromotions([]);
        setReviews([]);
        setBanners([]);
        setMedia([]);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Normalize arrays for safe usage ---
  const videosArr = Array.isArray(videos) ? videos : [];
  const mediaArr = Array.isArray(media) ? media : [];
  const promosArr = Array.isArray(promotions) ? promotions : [];
  const reviewsArr = Array.isArray(reviews) ? reviews : [];
  const bannersArr = Array.isArray(banners) ? banners : [];

  // --- Hero video ---
  const featuredVideo =
    videosArr.find((v) => v?.is_featured) || videosArr.find((v) => v?.is_active);
  const heroVideoUrl = getMediaUrl(featuredVideo) || LOCAL_FALLBACK_VIDEO;

  // --- Mixed media ---
  const mixedMedia = [...videosArr, ...mediaArr].filter((m) => m?.is_active);
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
            <button onClick={() => navigate("/bookings")} className="btn-primary">
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
            <NewsletterSignup />
          </div>
        </div>
      )}

      {/* === Services === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* === Promotions === */}
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
          {bannersArr.length > 0 ? (
            <div className="banners-grid">
              {bannersArr.map((b, idx) => (
                <div key={b.id ?? b.image_url ?? idx} className="banner-card">
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
              {mixedMedia.map((m, idx) => {
                const url = getMediaUrl(m);
                const video = isVideoItem(m, url);
                return video ? (
                  <video key={m.id ?? url ?? idx} src={url} controls />
                ) : (
                  <img key={m.id ?? url ?? idx} src={url} alt={m.title || "media"} />
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
              {featuredMedia.map((m, idx) => {
                const url = getMediaUrl(m);
                const video = isVideoItem(m, url);
                return video ? (
                  <video key={m.id ?? url ?? idx} src={url} controls />
                ) : (
                  <img key={m.id ?? url ?? idx} src={url} alt={m.title || "featured"} />
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
