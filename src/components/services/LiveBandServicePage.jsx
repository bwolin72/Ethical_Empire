import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServiceCategory from "./ServiceCategory";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";
import "./liveband.css";

/* ✅ Import images correctly */
import corporatePerformance from "../../assets/liveband/corporate-performance.png";
import weddingBand from "../../assets/liveband/wedding-band.png";
import festivalBand from "../../assets/liveband/festival-band.png";
import livebandHero from "../../assets/liveband/liveband-hero.png";

/* ---------- Helpers ---------- */
const toArray = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

const getMediaUrl = (m) =>
  m?.secure_url ||
  m?.url?.full ||
  m?.url ||
  m?.video_url ||
  m?.file_url ||
  m?.src ||
  "";

/* ---------- Motion Variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

/* ---------- LiveBandServicePage ---------- */
export default function LiveBandServicePage() {
  const navigate = useNavigate();

  // --- Media and Videos ---
  const { data: mediaRaw, loading: mediaLoading } = useFetcher(
    "media",
    "liveband",
    { is_active: true },
    { resource: "media" }
  );

  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "liveband",
    { is_active: true },
    { resource: "videos" }
  );

  const mediaCards = toArray(mediaRaw);

  // --- Hero video setup ---
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length && !videoLoading) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured) || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  /* ---------- Live Band Service Categories ---------- */
  const liveBandCategories = [
    {
      title: "Corporate & Luxury Events",
      image: corporatePerformance,
      services: [
        {
          name: "Gala & Award Ceremonies",
          description:
            "Premium live music performances for executive events and product launches in Ghana and across West Africa.",
        },
        {
          name: "Conference Entertainment",
          description:
            "Smooth jazz, instrumental interludes, and curated playlists for professional ambiance.",
        },
        {
          name: "Cocktail & Dinner Sets",
          description:
            "Soft acoustic or instrumental duos for elegant gatherings.",
        },
      ],
    },
    {
      title: "Weddings & Private Celebrations",
      image: weddingBand,
      services: [
        {
          name: "Wedding Reception Bands",
          description:
            "Energetic live performances that elevate your big day.",
        },
        {
          name: "Traditional & Highlife Sets",
          description:
            "Ghanaian and Afrobeat fusions that celebrate culture.",
        },
        {
          name: "Bridal Entry Music",
          description:
            "Customized entry compositions with live instrumental backing.",
        },
      ],
    },
    {
      title: "Concerts & Festivals",
      image: festivalBand,
      services: [
        {
          name: "Full Stage Band Setup",
          description:
            "Professional-grade lighting, sound, and multi-instrument ensembles for large-scale shows.",
        },
        {
          name: "Backing Bands for Artists",
          description:
            "Experienced musicians supporting top acts across genres.",
        },
        {
          name: "Outdoor & Street Performances",
          description:
            "Dynamic open-air performances designed to energize any crowd.",
        },
      ],
    },
  ];

  return (
    <div className="liveband-page-container">
      {/* === HERO SECTION === */}
      <section className="liveband-hero-section" aria-label="Live Band Hero">
        {videoUrl && !videoLoading ? (
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
            <div className="hero-overlay" />

            <motion.div
              className="hero-content glass-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <h1 className="hero-title">Live Band & Performances</h1>
              <p className="hero-subtitle">
                Experience Ghana’s most electrifying live music — from soulful
                weddings to world-class concerts, we bring rhythm, energy, and
                artistry to every event.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  Book a Live Band
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    window.scrollTo({ top: 800, behavior: "smooth" })
                  }
                >
                  Watch Performances
                </button>
              </div>
            </motion.div>

            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : (
          <div
            className="hero-fallback"
            style={{ backgroundImage: `url(${livebandHero})` }}
          >
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1 className="hero-title">Feel the Rhythm</h1>
              <p className="hero-subtitle">
                Bringing Ghanaian beats and world-class performance energy to
                every stage.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* === SERVICE CATEGORIES === */}
      <motion.section
        className="section liveband-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Our Live Band Services</h2>
        <p className="section-description">
          Explore dynamic music experiences tailored for weddings, corporate
          events, and cultural celebrations across Ghana and West Africa.
        </p>

        <div className="liveband-category-grid">
          {liveBandCategories.map((cat, i) => (
            <motion.div
              key={i}
              className="liveband-category-card"
              variants={zoomIn}
            >
              <img
                src={cat.image}
                alt={`${cat.title} in Ghana and West Africa`}
                className="liveband-category-image"
                loading="lazy"
              />
              <ServiceCategory category={cat} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === PERFORMANCE GALLERY === */}
      <motion.section className="section gallery-section" variants={fadeUp}>
        <h2>Performance Highlights</h2>
        <p>
          Watch our most iconic shows — high-energy, soulful, and unforgettable
          performances captured across Ghana’s premier stages.
        </p>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MediaSkeleton key={i} />
              ))
            : mediaCards
                .slice(0, 6)
                .map((m, i) => <MediaCard key={m.id ?? i} media={m} />)}
        </div>
      </motion.section>

      {/* === REVIEWS === */}
      <ReviewsLayout
        title="Client Impressions"
        description="Hear what our audiences say about Eethm Live Band"
      >
        <Reviews limit={6} hideForm={true} category="liveband" />
      </ReviewsLayout>
    </div>
  );
}
