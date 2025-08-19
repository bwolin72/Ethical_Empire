// src/pages/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useMediaFetcher from "../../hooks/useMediaFetcher";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import ReCAPTCHA from "react-google-recaptcha"; // ✅ reCAPTCHA
import "./EethmHome.css";

// --- Helpers ---
const getMediaUrl = (media) => {
  if (!media) return "";
  const val =
    (media?.url && (media.url.full ?? media.url)) ??
    media?.file_url ??
    media?.file ??
    media?.video_url ??
    "";
  return typeof val === "string" ? val : String(val ?? "");
};

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // Hero fetch
  const heroFetch = useMediaFetcher("home");
  const heroArray = heroFetch?.media ?? heroFetch?.data ?? [];
  const heroLoading = Boolean(heroFetch?.loading);
  const heroError = heroFetch?.error ?? null;
  const heroMedia = Array.isArray(heroArray) ? heroArray[0] ?? null : heroArray ?? null;
  const heroURL = getMediaUrl(heroMedia);

  const isHeroVideo = heroURL && heroURL.toLowerCase().endsWith(".mp4");
  const isHeroImage = heroURL && !isHeroVideo;

  // Backend videos
  const [videos, setVideos] = useState([]);
  const [videosError, setVideosError] = useState(null);
  const featuredVideo =
    Array.isArray(videos) && videos.length > 0
      ? videos.find((v) => v?.is_featured) || videos[0]
      : null;
  const featuredVideoUrl = getMediaUrl(featuredVideo);

  const resolvedVideoSrc =
    (featuredVideoUrl && featuredVideoUrl.toLowerCase().endsWith(".mp4") && featuredVideoUrl) ||
    (isHeroVideo && heroURL) ||
    LOCAL_FALLBACK_VIDEO;

  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Other API data
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promoError, setPromoError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Keep muted in sync
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = isMuted;
      } catch (_) {}
    }
  }, [isMuted]);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches && videoRef.current) {
        videoRef.current.pause();
      }
    } catch (_) {}
  }, []);

  const toggleMute = () => setIsMuted((p) => !p);

  // Fetch from backend
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [videoRes, promoRes, reviewRes, serviceRes] = await Promise.all([
          apiService.getVideos(),
          apiService.getPromotions(),
          apiService.getReviews(),
          apiService.getServices(),
        ]);

        if (!mounted) return;

        const allVideos = Array.isArray(videoRes?.data)
          ? videoRes.data
          : Array.isArray(videoRes)
          ? videoRes
          : [];

        setVideos(
          allVideos.filter(
            (v) => v?.is_active && Array.isArray(v?.endpoints) && v.endpoints.includes("home")
          )
        );

        setPromotions(Array.isArray(promoRes?.data) ? promoRes.data : []);
        setReviews(Array.isArray(reviewRes?.data) ? reviewRes.data : []);
        setServices(Array.isArray(serviceRes?.data) ? serviceRes.data : []);
      } catch (err) {
        if (!mounted) return;
        console.error("❌ API fetch failed:", err);

        const status = err?.response?.status;
        const url = err?.config?.url ?? "";

        if (status === 401) {
          setVideos([]);
          setVideosError("Unauthorized — showing fallback video.");
        } else {
          if (url.includes("promotions")) setPromoError("Failed to load promotions.");
          if (url.includes("reviews")) setReviewError("Failed to load reviews.");
          if (url.includes("services")) setServicesError("Failed to load services.");
          setVideosError("Failed to load videos — using fallback video.");
        }
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // Newsletter subscribe
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterError("");
    setNewsletterSuccess("");

    const email = String(newsletterEmail ?? "").trim();
    if (!email || !email.includes("@")) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }
    if (!recaptchaToken) {
      setNewsletterError("Please complete the reCAPTCHA.");
      return;
    }

    try {
      const res = await apiService.subscribeNewsletter(email, recaptchaToken);
      if ([200, 201].includes(res?.status)) {
        setNewsletterSuccess(res?.data?.message ?? "Thank you for subscribing!");
        setNewsletterEmail("");
        setRecaptchaToken(null);
      } else {
        setNewsletterError("Subscription failed. Please try again later.");
      }
    } catch (err) {
      setNewsletterError(
        err?.response?.data?.error ?? "Subscription failed. Please try again later."
      );
    }
  };

  // Effective src
  const effectiveVideoSrc = String(!videoLoadFailed ? resolvedVideoSrc : LOCAL_FALLBACK_VIDEO || "");
  const effectivePoster = String(isHeroImage ? heroURL : LOCAL_FALLBACK_IMAGE || "");

  return (
    <div className="eethm-home-page">
      {/* Hero */}
      <section className="video-hero-section">
        {heroLoading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : heroError ? (
          <p className="video-fallback error-text">
            {typeof heroError === "string" ? heroError : "Failed to load hero media."}
          </p>
        ) : (
          <>
            {effectiveVideoSrc ? (
              <>
                <video
                  ref={videoRef}
                  className="background-video"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  poster={effectivePoster}
                  onError={() => setVideoLoadFailed(true)}
                >
                  <source src={effectiveVideoSrc} type="video/mp4" />
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
                      type="button"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => setShowNewsletterForm(true)}
                      className="btn-secondary"
                      type="button"
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

                {videosError && <div className="video-error">{videosError}</div>}
              </>
            ) : isHeroImage ? (
              <img
                src={heroURL || LOCAL_FALLBACK_IMAGE}
                alt="Hero"
                className="background-video"
              />
            ) : (
              <p className="video-fallback">No hero media available.</p>
            )}
          </>
        )}
      </section>

      {/* Newsletter Modal */}
      {showNewsletterForm && (
        <div
          className="newsletter-modal-backdrop"
          onClick={() => setShowNewsletterForm(false)}
        >
          <div
            className="newsletter-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
          >
            <button
              className="newsletter-close-btn"
              onClick={() => setShowNewsletterForm(false)}
              type="button"
            >
              &times;
            </button>

            <h2 id="newsletter-title">Subscribe to Our Newsletter</h2>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                className="newsletter-recaptcha"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>

            {newsletterSuccess && (
              <p className="success-message">{newsletterSuccess}</p>
            )}
            {newsletterError && (
              <p className="error-message">{newsletterError}</p>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      <FadeInSection>
        <section className="services-page">
          <h2>Our Services</h2>
          {servicesError && <p className="error-text">{servicesError}</p>}
          {Array.isArray(services) && services.length > 0 ? (
            <div className="service-card-grid">
              {services.map((service, idx) => {
                const slugOrId = service?.slug ?? service?.id ?? "";
                return (
                  <div
                    key={service.id ?? service.slug ?? idx}
                    className="service-flip-card"
                    onClick={() => navigate(`/Services/${slugOrId}`)}
                  >
                    <div className="service-flip-card-inner">
                      <div className="service-flip-card-front">
                        {service.image && (
                          <img
                            src={service.image}
                            alt={service.title}
                            className="service-image"
                          />
                        )}
                        <h3>{service.title}</h3>
                      </div>
                      <div className="service-flip-card-back">
                        <p>{service.description}</p>
                        <span className="click-hint">Click to view more</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !servicesError && <p>Loading services...</p>
          )}
        </section>
      </FadeInSection>

      {/* Promotions */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Current Offers</h2>
          {promotions?.length > 0 ? (
            <div className="promotions-grid">
              {promotions.map((promo, idx) => (
                <article key={promo.id ?? idx} className="promotion-card">
                  {promo.image_url && (
                    <img src={promo.image_url} alt={promo.title} />
                  )}
                  <div className="promotion-card-content">
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                    {promo.discount_percentage && (
                      <p className="discount">
                        Save {promo.discount_percentage}%
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : promoError ? (
            <p className="error-text">{promoError}</p>
          ) : (
            <p>No current promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* Reviews */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {reviews?.length > 0 ? (
            <div className="reviews-container">
              {reviews.map((review, idx) => (
                <div key={review.id ?? idx} className="review-card">
                  <p className="review-text">"{review.comment}"</p>
                  <p className="review-author">— {review.name}</p>
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p className="error-text">{reviewError}</p>
          ) : (
            <p>No client reviews available.</p>
          )}
        </section>
      </FadeInSection>

      {/* Highlights & Media */}
      <FadeInSection>
        <section className="banners-section">
          <h2>Highlights from Our Services</h2>
          <BannerCards endpoint="home" />
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="banners-section">
          <h2>Featured Media</h2>
          <MediaCards endpoint="home" type="media" />
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
