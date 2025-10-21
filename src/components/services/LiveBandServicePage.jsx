// src/components/services/LiveBandServicePage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import VideoGallery from "../videos/VideoGallery";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServiceCategory from "./ServiceCategory";
import ReviewsLayout from "../user/ReviewsLayout";
import Reviews from "../user/Reviews";
import useFetcher from "../../hooks/useFetcher";

import corporateImg from "../../assets/liveband/corporate-performance.png";
import weddingImg from "../../assets/liveband/wedding-band.png";
import festivalImg from "../../assets/liveband/festival-band.png";
import heroFallback from "../../assets/liveband/liveband-hero.jpg";

import "./liveband.css";

/* ---------- Helpers ---------- */
const toArray = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

/* ---------- Motion Variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LiveBandServicePage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Banners: type=banner, endpoint=LiveBandServicePage
  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "mediafiles",
    "LiveBandServicePage",
    { type: "banner", is_active: true },
    { resource: "media" }
  );

  // Videos
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "LiveBandServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  // Media images
  const { data: mediaRaw, loading: mediaLoading } = useFetcher(
    "mediafiles",
    "LiveBandServicePage",
    { type: "media", is_active: true },
    { resource: "media" }
  );

  // Other services (from backend) — we'll fetch all services and filter out "Live Band" category
  const { data: servicesRaw, loading: servicesLoading } = useFetcher(
    "services",
    "all",
    {},
    { resource: "services" }
  );

  const banners = toArray(bannerRaw);
  const videos = toArray(videosRaw);
  const mediaCards = toArray(mediaRaw);
  const services = toArray(servicesRaw);

  // Local static service categories (frontend-only) with local images
  const staticCategories = [
    {
      name: "Corporate & Luxury Events",
      description:
        "Live music that defines class — perfect for corporate galas, product launches, and executive retreats.",
      image: corporateImg,
      cta: { label: "Explore Corporate", href: "/services?category=Corporate" },
    },
    {
      name: "Weddings & Private Celebrations",
      description:
        "From soulful bridal walks to energetic receptions, our live band brings your love story to life.",
      image: weddingImg,
      cta: { label: "Plan Your Wedding", href: "/services?category=Weddings" },
    },
    {
      name: "Concerts & Festivals",
      description:
        "Professional setups for large-scale performances, festivals, and artist collaborations across Ghana.",
      image: festivalImg,
      cta: { label: "Book a Concert", href: "/services?category=Concerts" },
    },
  ];

  // Choose featured video URL (if any)
  const [videoUrl, setVideoUrl] = useState(null);
  useEffect(() => {
    if (!videos || videos.length === 0) {
      setVideoUrl(null);
      return;
    }
    const featured = videos.find((v) => v.is_featured) ?? videos[0];
    // videos API normalization may use video_url or videoFile or url - handle common keys
    const url = featured?.video_url || featured?.videoFile || featured?.videoFileUrl || featured?.videoUrl || featured?.url || null;
    setVideoUrl(url);
  }, [videos]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  // Scroll helper
  const scrollToGallery = () => {
    document.querySelector(".gallery-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter other services to exclude those in category "Live Band" (robust checks)
  const otherServices = services?.filter((s) => {
    if (!s) return false;
    const cat = s.category || s.category_name || (s.category && s.category.name);
    const catName = typeof cat === "string" ? cat : cat?.name;
    return !(catName && catName.toLowerCase().includes("live band"));
  });

  return (
    <div className="liveband-page-container">
      {/* HERO */}
      <section className="liveband-hero-section" aria-label="Live Band Hero">
        {/* BannerCards will render hero banners (fallback to local hero image if none) */}
        <div className="hero-visual-wrap" aria-hidden>
          {banners && banners.length > 0 ? (
            <BannerCards endpoint="LiveBandServicePage" type="banner" loading={bannerLoading} />
          ) : (
            <div className="hero-fallback" style={{ backgroundImage: `url(${heroFallback})` }} />
          )}

          {videoUrl && (
            <video
              ref={videoRef}
              className="hero-video"
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
            />
          )}
        </div>

        <div className="hero-overlay" />

        <motion.div
          className="hero-content glass-panel"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <h1 className="hero-title">Live Band & Performances</h1>
          <p className="hero-subtitle">
            Experience Ghana’s most electrifying live performances — from weddings to festivals, our musicians
            bring rhythm, artistry, and passion to every stage.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Book a Live Band
            </button>
            <button className="btn btn-outline" onClick={scrollToGallery}>
              Watch Performances
            </button>
          </div>
        </motion.div>

        <button className="mute-button" onClick={toggleMute} aria-pressed={!isMuted}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </section>

      {/* STATIC FRONTEND-ONLY CATEGORIES */}
      <motion.section
        className="section liveband-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <h2>Our Live Band Services</h2>
        <p className="section-description">
          Explore immersive music experiences crafted for elegant weddings, corporate gatherings, and large-scale concerts.
        </p>

        <div className="liveband-category-grid">
          {staticCategories.map((c, idx) => (
            <motion.article key={idx} className="liveband-category-card" variants={zoomIn}>
              <div className="card-media">
                <img src={c.image} alt={c.name} className="liveband-category-image" loading="lazy" />
              </div>
              <div className="card-body">
                <h3 className="card-title">{c.name}</h3>
                <p className="card-desc">{c.description}</p>
                <div className="card-actions">
                  <button className="btn btn-outline" onClick={() => navigate(c.cta.href)}>
                    {c.cta.label}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* PERFORMANCE VIDEOS */}
      <motion.section
        className="section video-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Performance Videos</h2>
        <p className="section-description">Watch featured and recent shows captured live on stage.</p>
        <VideoGallery endpoint="LiveBandServicePage" />
      </motion.section>

      {/* IMAGE GALLERY */}
      <motion.section
        className="section gallery-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Performance Highlights</h2>
        <p className="section-description">Discover our most memorable performances — soulful, energetic, unforgettable.</p>

        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : (mediaCards?.length || 0) > 0
            ? mediaCards.slice(0, 9).map((m, i) => <MediaCard key={m.id ?? i} media={m} />)
            : (
                <div className="empty-placeholder">
                  <p>No gallery items yet. Check back soon or upload media from the dashboard.</p>
                </div>
              )}
        </div>
      </motion.section>

      {/* OTHER SERVICES (dynamic from backend, excluding Live Band) */}
      <motion.section
        className="section other-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
      >
        <h2>Other Services</h2>
        <p className="section-description">
          Explore complementary services for your event — catering, decor, multimedia and more.
        </p>

        {servicesLoading ? (
          <div className="other-services-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="service-skeleton" key={i} />
            ))}
          </div>
        ) : otherServices && otherServices.length > 0 ? (
          <div className="other-services-grid">
            {otherServices.slice(0, 6).map((s) => (
              // ServiceCategory expects a category-like prop structure; we pass the service as category for display
              <div className="other-service-card" key={s.id || s.name}>
                <ServiceCategory category={s} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-placeholder">
            <p>No other services found.</p>
          </div>
        )}
      </motion.section>

      {/* REVIEWS */}
      <ReviewsLayout title="Client Impressions" description="What our audiences say about Eethm Live Band">
        <Reviews limit={6} hideForm category="LiveBandServicePage" />
      </ReviewsLayout>
    </div>
  );
}
