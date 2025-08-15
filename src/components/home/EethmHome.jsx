// src/pages/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useMediaFetcher from "../../hooks/useMediaFetcher";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import "./EethmHome.css";

/**
 * Returns a safe string video/image URL from a media object.
 * Always returns a string (possibly empty).
 */
const getMediaUrl = (media) => {
  if (!media) return "";
  const val = media?.url?.full ?? media?.file_url ?? media?.file ?? media?.url ?? "";
  return typeof val === "string" ? val : String(val);
};

// Local public folder fallback (public/mock/hero-video.mp4)
const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // ===== Hero media (useMediaFetcher) =====
  // Use the 'home' key (string) — newer hook versions expect the key string.
  // This code also tolerates hook implementations that return { media } or { data }.
  const heroFetch = useMediaFetcher("home");
  const heroArray = heroFetch?.media ?? heroFetch?.data ?? [];
  const heroLoading = Boolean(heroFetch?.loading);
  const heroError = heroFetch?.error ?? null;

  const heroMedia = Array.isArray(heroArray) ? heroArray[0] ?? null : heroArray ?? null;
  const heroURL = getMediaUrl(heroMedia);
  const isImageHero = heroURL !== "" && typeof heroURL === "string" && !heroURL.toLowerCase().endsWith(".mp4");
  const isHeroVideoUrl = heroURL !== "" && typeof heroURL === "string" && heroURL.toLowerCase().endsWith(".mp4");

  // ===== Videos from backend (apiService) =====
  const [videos, setVideos] = useState([]);
  const [videosError, setVideosError] = useState(null);

  // featuredVideo selection (defensive)
  const featuredVideo = Array.isArray(videos) ? videos.find((v) => v?.is_featured) || videos[0] : null;
  const rawFeaturedUrl = featuredVideo?.file ?? featuredVideo?.url ?? featuredVideo?.video_url ?? "";
  const featuredVideoUrl = typeof rawFeaturedUrl === "string" ? rawFeaturedUrl : String(rawFeaturedUrl ?? "");

  // final chosen video source: prefer featuredVideoUrl -> hero media video -> local fallback
  const resolvedVideoSrc = featuredVideoUrl || (isHeroVideoUrl ? heroURL : "") || LOCAL_FALLBACK_VIDEO;

  const [isMuted, setIsMuted] = useState(true);

  // ===== Other data: services, promotions, reviews =====
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promoError, setPromoError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // Sync video muted state to DOM node
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = isMuted;
      } catch (_) {
        // ignore if DOM not ready
      }
    }
  }, [isMuted]);

  // Respect reduced motion preferences
  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches && videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (_) {}
      }
    } catch (_) {
      // ignore on older browsers
    }
  }, []);

  const toggleMute = () => setIsMuted((p) => !p);

  // Fetch videos + promotions + reviews + services
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [videoRes, promoRes, reviewRes, serviceRes] = await Promise.all([
          apiService.getVideos(),
          apiService.getActivePromotions(),
          apiService.getReviews(),
          apiService.getServices(),
        ]);

        if (!mounted) return;

        // Videos: defensive parsing
        const allVideos = Array.isArray(videoRes?.data) ? videoRes.data : Array.isArray(videoRes) ? videoRes : [];
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

        // set specific errors where applicable
        if (status === 401) {
          // unauthorized — backend protected; we still keep local fallback video
          setVideos([]); // will result in local fallback later
          setVideosError("Unauthorized (login required) — showing fallback video.");
        } else {
          if (url.includes("promotions")) setPromoError("Failed to load promotions.");
          if (url.includes("reviews")) setReviewError("Failed to load reviews.");
          if (url.includes("services")) setServicesError("Failed to load services.");
          // generic videos error
          setVideosError("Failed to load videos — using fallback video.");
        }
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  // Newsletter subscribe handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterError("");
    setNewsletterSuccess("");

    const email = String(newsletterEmail ?? "").trim();
    if (!email || !email.includes("@")) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await apiService.subscribeNewsletter(email);
      if ([200, 201].includes(res?.status)) {
        setNewsletterSuccess(res?.data?.message ?? "Thank you for subscribing!");
        setNewsletterEmail("");
      } else {
        setNewsletterError("Subscription failed. Please try again later.");
      }
    } catch (err) {
      setNewsletterError(err?.response?.data?.error ?? "Subscription failed. Please try again later.");
    }
  };

  return (
    <div className="eethm-home-page">
      {/* ===================== Hero Section ===================== */}
      <section className="video-hero-section">
        {heroLoading ? (
          <p className="video-fallback">Loading hero...</p>
        ) : heroError ? (
          <p className="video-fallback" style={{ color: "var(--color-error)" }}>
            {typeof heroError === "string" ? heroError : "Failed to load hero media."}
          </p>
        ) : (
          // Prefer video (backend featured -> hero media video -> fallback)
          <>
            {/* If resolvedVideoSrc is truthy we render a background video */}
            {resolvedVideoSrc ? (
              <>
                <video
                  ref={videoRef}
                  className="background-video"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  poster={isImageHero ? heroURL : undefined}
                  aria-hidden="true"
                >
                  <source src={resolvedVideoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <div className="overlay-content" role="presentation">
                  <h1>Ethical Multimedia GH Services</h1>
                  <p>Live Band • Catering • Multimedia • Decor Services</p>
                  <div className="hero-buttons">
                    <button onClick={() => navigate("/bookings")} className="btn-primary" type="button">
                      Book Now
                    </button>
                    <button onClick={() => setShowNewsletterForm(true)} className="newsletter-btn" type="button">
                      📩 Subscribe to Newsletter
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
              </>
            ) : isImageHero ? (
              <>
                <img
                  src={heroURL}
                  alt="Hero"
                  className="background-video"
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
                <div className="overlay-content" role="presentation">
                  <h1>Ethical Multimedia GH Services</h1>
                  <p>Live Band • Catering • Multimedia • Decor Services</p>
                  <button onClick={() => setShowNewsletterForm(true)} className="newsletter-btn" type="button">
                    📩 Subscribe to Newsletter
                  </button>
                </div>
              </>
            ) : (
              <p className="video-fallback">No hero media or video available.</p>
            )}
          </>
        )}
      </section>

      {/* ===================== Newsletter Modal ===================== */}
      {showNewsletterForm && (
        <div className="newsletter-modal-backdrop" onClick={() => setShowNewsletterForm(false)}>
          <div
            className="newsletter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="newsletter-close-btn"
              onClick={() => setShowNewsletterForm(false)}
              aria-label="Close newsletter form"
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
                aria-label="Email address"
                autoFocus
              />
              <button type="submit">Subscribe</button>
            </form>

            {newsletterSuccess && <p className="success-message">{newsletterSuccess}</p>}
            {newsletterError && <p className="error-message">{newsletterError}</p>}
          </div>
        </div>
      )}

      {/* ===================== Services (Flip Cards) ===================== */}
      <FadeInSection>
        <section className="services-page" aria-labelledby="services-title">
          <h2 id="services-title">Our Services</h2>

          {servicesError && <p style={{ color: "var(--color-error)" }}>{servicesError}</p>}

          {Array.isArray(services) && services.length > 0 ? (
            <div className="service-card-grid">
              {services.map((service) => {
                const slugOrId = service?.slug ?? service?.id ?? "";
                const handleNavigate = () => {
                  if (slugOrId !== "") navigate(`/services/${slugOrId}`);
                };

                return (
                  <div
                    key={service.id ?? service.slug ?? Math.random()}
                    className="service-flip-card"
                    role="button"
                    tabIndex={0}
                    onClick={handleNavigate}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNavigate();
                      }
                    }}
                  >
                    <div className="service-flip-card-inner">
                      <div className="service-flip-card-front">
                        {service.image && (
                          <img
                            src={service.image}
                            alt={service.title || service.name || "Service"}
                            className="service-image"
                            loading="lazy"
                            decoding="async"
                            onError={(ev) => {
                              ev.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <h3>{service.title || service.name || "Service"}</h3>
                      </div>

                      <div className="service-flip-card-back">
                        {service.description && <p>{service.description}</p>}
                        {Array.isArray(service.details) && service.details.length > 0 && (
                          <ul>
                            {service.details.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        )}
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

      {/* ===================== Promotions ===================== */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Current Offers</h2>
          {Array.isArray(promotions) && promotions.length > 0 ? (
            <div className="promotions-grid">
              {promotions.map((promo) => (
                <article key={promo.id ?? JSON.stringify(promo)} className="promotion-card">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.title ?? "Promotion"}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="promotion-card-content">
                    <h3>{promo.title}</h3>
                    {promo.description && <p>{promo.description}</p>}
                    {promo.discount_percentage && <p className="discount">Save {promo.discount_percentage}%</p>}
                    {(promo.valid_from || promo.valid_to) && (
                      <p className="validity">
                        Valid: {promo.valid_from ?? "—"} – {promo.valid_to ?? "—"}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : promoError ? (
            <p style={{ color: "var(--color-error)" }}>{promoError}</p>
          ) : (
            <p>No current promotions.</p>
          )}
        </section>
      </FadeInSection>

      {/* ===================== Reviews ===================== */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            <div className="reviews-container">
              {reviews.map((review) => (
                <div key={review.id ?? JSON.stringify(review)} className="review-card">
                  {review.name && <p className="review-author">— {review.name}</p>}
                  {review.comment && <p className="review-text">"{review.comment}"</p>}
                </div>
              ))}
            </div>
          ) : reviewError ? (
            <p style={{ color: "var(--color-error)" }}>{reviewError}</p>
          ) : (
            <p>No client reviews available.</p>
          )}
        </section>
      </FadeInSection>

      {/* ===================== Highlights & Media ===================== */}
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
