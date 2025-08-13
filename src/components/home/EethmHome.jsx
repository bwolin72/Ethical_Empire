// src/pages/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useMediaFetcher from "../../hooks/useMediaFetcher";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import FadeInSection from "../FadeInSection";
import "./EethmHome.css";

const getMediaUrl = (media) => {
  if (!media) return "";
  return media.url?.full || media.file_url || "";
};

const EethmHome = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // ===== Hero Media =====
  const {
    media: heroMediaArr,
    loading: heroLoading,
    error: heroError,
  } = useMediaFetcher({ type: "media", endpoint: "EethmHome", isActive: true });

  const heroMedia = heroMediaArr?.[0] || null;
  const heroURL = getMediaUrl(heroMedia);
  const isImageHero = heroURL && !heroURL.endsWith(".mp4");

  // ===== Videos (for video hero) =====
  const [videos, setVideos] = useState([]);
  const featuredVideo = videos.find((v) => v.is_featured) || videos[0];
  const featuredVideoUrl = featuredVideo?.file || featuredVideo?.url || "";

  const [isMuted, setIsMuted] = useState(true);

  // ===== Services, Promotions, Reviews =====
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promoError, setPromoError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);

  // ===== Newsletter =====
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // Keep <video> muted state in sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Respect reduced motion: pause autoplay background video
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches && videoRef.current) {
      try {
        videoRef.current.pause();
      } catch (_) {}
    }
  }, []);

  // Toggle mute/unmute video
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Fetch data from apiService
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Videos
        const videoRes = await apiService.getVideos();
        const allVideos = Array.isArray(videoRes.data) ? videoRes.data : [];
        setVideos(
          allVideos.filter(
            (v) => v.is_active && v.endpoints?.includes("EethmHome")
          )
        );

        // Promotions
        const promoRes = await apiService.getActivePromotions();
        setPromotions(Array.isArray(promoRes.data) ? promoRes.data : []);

        // Reviews
        const reviewRes = await apiService.getReviews();
        setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);

        // Services
        const serviceRes = await apiService.getServices();
        setServices(Array.isArray(serviceRes.data) ? serviceRes.data : []);
      } catch (err) {
        console.error("❌ API fetch failed:", err);
        const url = err?.config?.url || "";
        if (url.includes("promotions")) setPromoError("Failed to load promotions.");
        if (url.includes("reviews")) setReviewError("Failed to load reviews.");
        if (url.includes("services")) setServicesError("Failed to load services.");
      }
    };

    fetchData();
  }, []);

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterError("");
    setNewsletterSuccess("");

    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await apiService.subscribeNewsletter(newsletterEmail);
      if ([200, 201].includes(response.status)) {
        setNewsletterSuccess(response.data?.message || "Thank you for subscribing!");
        setNewsletterEmail("");
      } else {
        setNewsletterError("Subscription failed. Please try again later.");
      }
    } catch (err) {
      setNewsletterError(
        err.response?.data?.error || "Subscription failed. Please try again later."
      );
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
            {heroError}
          </p>
        ) : featuredVideoUrl ? (
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
              <source src={featuredVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="overlay-content" role="presentation">
              <h1>Ethical Multimedia GH Services</h1>
              <p>Live Band • Catering • Multimedia • Decor Services</p>
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
                  className="newsletter-btn"
                  type="button"
                >
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
              <button
                onClick={() => setShowNewsletterForm(true)}
                className="newsletter-btn"
                type="button"
              >
                📩 Subscribe to Newsletter
              </button>
            </div>
          </>
        ) : (
          <p className="video-fallback">No hero media or video available.</p>
        )}
      </section>

      {/* ===================== Newsletter Modal ===================== */}
      {showNewsletterForm && (
        <div
          className="newsletter-modal-backdrop"
          onClick={() => setShowNewsletterForm(false)}
        >
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
        <section className="services-page">
          <h2>Our Services</h2>
          {servicesError && <p style={{ color: "var(--color-error)" }}>{servicesError}</p>}

          {services.length > 0 ? (
            <div className="service-card-grid">
              {services.map((service) => (
                <div
                  key={service.id || service.slug}
                  className="service-flip-card"
                  onClick={() => navigate(`/services/${service.slug || service.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/services/${service.slug || service.id}`);
                    }
                  }}
                >
                  <div className="service-flip-card-inner">
                    <div className="service-flip-card-front">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.title || service.name}
                          className="service-image"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        />
                      )}
                      <h3>{service.title || service.name}</h3>
                    </div>

                    <div className="service-flip-card-back">
                      {service.description && <p>{service.description}</p>}
                      {Array.isArray(service.details) && service.details.length > 0 && (
                        <ul>
                          {service.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      )}
                      <span className="click-hint">Click to view more</span>
                    </div>
                  </div>
                </div>
              ))}
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
          {promotions.length > 0 ? (
            // NOTE: the grid is applied directly by .promotions-section via your CSS
            promotions.map((promo) => (
              <article key={promo.id} className="promotion-card">
                {promo.image_url && (
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <div className="promotion-card-content">
                  <h3>{promo.title}</h3>
                  {promo.description && <p>{promo.description}</p>}
                  {promo.discount_percentage && (
                    <p className="discount">Save {promo.discount_percentage}%</p>
                  )}
                  {(promo.valid_from || promo.valid_to) && (
                    <p className="validity">
                      Valid: {promo.valid_from || "—"} – {promo.valid_to || "—"}
                    </p>
                  )}
                </div>
              </article>
            ))
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
          {reviews.length > 0 ? (
            <div className="reviews-container">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
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
          {/* BannerCards should render .banner-cards / .banner-card internally to match CSS */}
          <BannerCards endpoint="EethmHome" />
        </section>
      </FadeInSection>

      <FadeInSection>
        <section className="banners-section">
          <h2>Featured Media</h2>
          {/* MediaCards should render .media-cards / .media-card internally to match CSS */}
          <MediaCards endpoint="EethmHome" type="media" />
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
