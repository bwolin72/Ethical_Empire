import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServiceCategory from "./ServiceCategory";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";
import "./decor.css";

/* ---------- Asset Imports ---------- */
import floralDecor from "../../assets/decor/floral-decor.png";
import lightingDecor from "../../assets/decor/lighting-decor.png";
import stageDecor from "../../assets/decor/stage-decor.png";
import decorHero from "../../assets/decor/decor-hero.png";

/* ---------- Helpers ---------- */
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (m) => {
  const c = [
    m?.secure_url,
    m?.url?.full,
    m?.url,
    m?.video_url,
    m?.video_file,
    m?.file_url,
    m?.file,
    m?.src,
    m?.path,
  ];
  return c.find((x) => typeof x === "string" && x.trim() !== "") || "";
};

/* ---------- Motion Variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

/* ---------- DecorServicePage ---------- */
export default function DecorServicePage() {
  const navigate = useNavigate();

  const { data: videosRaw, loading: videoLoading } = useFetcher("videos", "decor", { is_active: true }, { resource: "videos" });
  const { data: bannerRaw } = useFetcher("media", "banner", { category: "decor", is_active: true }, { resource: "media" });
  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher("media", "decor", { is_active: true }, { resource: "media" });

  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length && !videoLoading) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured));
  }, [videosRaw, videoLoading]);

  const bannerItems = toArray(bannerRaw);
  const mediaCards = toArray(mediaCardsRaw);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  /* ---------- Decor Categories ---------- */
  const decorCategories = [
    {
      title: "Floral & Table Decor",
      image: floralDecor,
      services: [
        { name: "Luxury Floral Arrangements", description: "Elegant centerpiece & aisle florals tailored to your event theme." },
        { name: "Table Styling", description: "Custom linens, cutlery, and accent decor for a cohesive luxury look." },
        { name: "Backdrop Flowers", description: "Stunning floral walls and stage florals ideal for weddings and ceremonies." },
      ],
    },
    {
      title: "Lighting & Ambience",
      image: lightingDecor,
      services: [
        { name: "Mood Lighting", description: "Create ambience with golden glow or soft pastels matching your brand colors." },
        { name: "Lanterns & Chandeliers", description: "Elegant hanging decor perfect for luxury Ghanaian weddings & galas." },
        { name: "LED Installations", description: "Dynamic event lighting for concerts, ceremonies, and corporate nights." },
      ],
    },
    {
      title: "Stage & Venue Design",
      image: stageDecor,
      services: [
        { name: "Stage Backdrops", description: "Theme-based or floral backdrops for premium West African events." },
        { name: "Draping & Ceiling Work", description: "Soft fabrics & ambient glow to elevate visual flow." },
        { name: "Entrance & Aisle Decor", description: "Create unforgettable first impressions for your guests." },
      ],
    },
  ];

  return (
    <div className="decor-page-container">
      {/* === HERO === */}
      <section className="decor-hero-section" aria-label="Decor Hero Section">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <div className="hero-overlay glass-gradient" />
            <motion.div
              className="hero-content glass-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <h1 className="hero-title">Decor & Event Design</h1>
              <p className="hero-subtitle">
                Transforming spaces across Ghana and West Africa with artistic floral design,
                immersive lighting, and bespoke venue styling.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
                  Book Decor Service
                </button>
                <button className="btn btn-outline" onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>
                  View Gallery
                </button>
              </div>
            </motion.div>
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : (
          <div
            className="hero-fallback glassmorphic-hero"
            style={{ backgroundImage: `url(${decorHero})` }}
          >
            <div className="hero-overlay" />
            <motion.div
              className="hero-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <h1 className="hero-title">Elegant Decor & Styling</h1>
              <p className="hero-subtitle">
                Experience luxury design artistry for weddings, corporate, and cultural events.
              </p>
            </motion.div>
          </div>
        )}
      </section>

      {/* === DECOR CATEGORIES === */}
      <motion.section
        className="section decor-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Our Decor Services</h2>
        <p className="section-description">
          From floral compositions to ambient lighting, we design timeless atmospheres for Ghanaian and international events.
        </p>
        <div className="decor-category-grid">
          {decorCategories.map((cat, i) => (
            <motion.div key={i} className="decor-category-card" variants={zoomIn}>
              <img
                src={cat.image}
                alt={`${cat.title} in Ghana and West Africa`}
                className="decor-category-image"
                loading="lazy"
              />
              <ServiceCategory category={cat} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === GALLERY === */}
      <motion.section className="section gallery-section" variants={fadeUp}>
        <h2>Decor Highlights</h2>
        <p>Explore our signature setups — elegant, cinematic, and locally inspired.</p>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.slice(0, 6).map((m, i) => (
                <MediaCard key={m.id ?? i} media={m} />
              ))}
        </div>
      </motion.section>

      {/* === REVIEWS === */}
      <ReviewsLayout
        title="Client Impressions"
        description="What our clients say about their Decor experiences"
      >
        <Reviews limit={6} hideForm={true} category="decor" />
      </ReviewsLayout>
    </div>
  );
}
