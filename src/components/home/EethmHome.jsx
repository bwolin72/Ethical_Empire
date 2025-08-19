// src/pages/home/EethmHome.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import BannerCards from "../context/BannerCards";
import FadeInSection from "../FadeInSection";
import ReCAPTCHA from "react-google-recaptcha";
import "./EethmHome.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

// --- Helpers ---
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
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);

  // API data
  const [videos, setVideos] = useState([]);
  const [services, setServices] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [media, setMedia] = useState([]);

  // Error states
  const [videosError, setVideosError] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Fetch all backend data
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        const [videoRes, promoRes, reviewRes, serviceRes, bannerRes, mediaRes] =
          await Promise.all([
            apiService.getVideos(),
            apiService.getPromotions(),
            apiService.getReviews(),
            apiService.getServices(),
            apiService.getBanners(),
            apiService.getMedia(),
          ]);

        if (!mounted) return;

        setVideos(videoRes?.data || []);
        setPromotions(promoRes?.data || []);
        setReviews(reviewRes?.data || []);
        setServices(serviceRes?.data || []);
        setBanners(bannerRes?.data || []);
        setMedia(mediaRes?.data || []);
      } catch (err) {
        console.error("❌ API fetch failed:", err);
        if (err?.config?.url?.includes("videos")) setVideosError("Failed to load videos");
        if (err?.config?.url?.includes("services")) setServicesError("Failed to load services");
        if (err?.config?.url?.includes("promotions")) setPromoError("Failed to load promotions");
        if (err?.config?.url?.includes("reviews")) setReviewError("Failed to load reviews");
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // Pick hero video
  const featuredVideo =
    videos.find((v) => v.is_featured) || videos.find((v) => v.is_active);
  const heroVideoUrl = getMediaUrl(featuredVideo) || LOCAL_FALLBACK_VIDEO;

  // Mixed gallery
  const mixedMedia = [...videos, ...media].filter((m) => m?.is_active);
  const featuredMedia = mixedMedia.filter((m) => m?.is_featured);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => setIsMuted((p) => !p);

  // Newsletter subscribe
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setNewsletterError("");
    setNewsletterSuccess("");

    if (!newsletterEmail.includes("@")) {
      setNewsletterError("Please enter a valid email.");
      return;
    }
    if (!recaptchaToken) {
      setNewsletterError("Please complete the reCAPTCHA.");
      return;
    }

    try {
      const res = await apiService.subscribeNewsletter(newsletterEmail, recaptchaToken);
      if ([200, 201].includes(res?.status)) {
        setNewsletterSuccess("Thank you for subscribing!");
        setNewsletterEmail("");
        setRecaptchaToken(null);
      } else {
        setNewsletterError("Subscription failed.");
      }
    } catch (err) {
      setNewsletterError("Subscription failed.");
    }
  };

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
            <button onClick={() => setShowNewsletterForm(true)} className="btn-secondary">
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

      {/* === Newsletter Modal === */}
      {showNewsletterForm && (
        <div className="newsletter-modal-backdrop" onClick={() => setShowNewsletterForm(false)}>
          <div
            className="newsletter-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button className="newsletter-close-btn" onClick={() => setShowNewsletterForm(false)}>
              &times;
            </button>
            <h2>Subscribe to Our Newsletter</h2>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                value={newsletterEmail}
                placeholder="Your email"
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
              />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
            {newsletterSuccess && <p className="success-message">{newsletterSuccess}</p>}
            {newsletterError && <p className="error-message">{newsletterError}</p>}
          </div>
        </div>
      )}

      {/* === Services === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Our Services</h2>
          {servicesError && <p className="error-text">{servicesError}</p>}
          {services?.length > 0 ? (
            <div className="service-card-grid">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="service-flip-card"
                  onClick={() => navigate(`/Services/${s.slug || s.id}`)}
                >
                  <div className="service-flip-card-inner">
                    <div className="service-flip-card-front">
                      {s.image && <img src={s.image} alt={s.title} />}
                      <h3>{s.title}</h3>
                    </div>
                    <div className="service-flip-card-back">
                      <p>{s.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>Loading services...</p>}
        </section>
      </FadeInSection>

      {/* === Promotions === */}
      <FadeInSection>
        <section className="promotions-section">
          <h2>Current Offers</h2>
          {promotions?.length > 0 ? (
            <div className="promotions-grid">
              {promotions.map((p) => (
                <article key={p.id} className="promotion-card">
                  {p.image_url && <img src={p.image_url} alt={p.title} />}
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    {p.discount_percentage && <p>Save {p.discount_percentage}%</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : promoError ? <p>{promoError}</p> : <p>No promotions.</p>}
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
          ) : reviewError ? <p>{reviewError}</p> : <p>No reviews.</p>}
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
          ) : <p>No media available.</p>}
        </section>
      </FadeInSection>

      {/* === Featured Media Horizontal Carousel === */}
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
          ) : <p>No featured media.</p>}
        </section>
      </FadeInSection>
    </div>
  );
};

export default EethmHome;
