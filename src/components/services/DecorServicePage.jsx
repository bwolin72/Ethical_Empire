// frontend/src/components/decor/DecorServicePage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServiceCategory from "./ServiceCategory"; // ✅ new modular service system
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";
import "./decor.css";

/* ---------------------------
   Helpers
--------------------------- */
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (m) => {
  if (!m) return "";
  const candidates = [
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
  return candidates.find((c) => typeof c === "string" && c.trim() !== "") || "";
};

/* ---------------------------
   Motion Variants
--------------------------- */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

/* ---------------------------
   DecorServicePage
--------------------------- */
export default function DecorServicePage() {
  const navigate = useNavigate();

  // --- Data fetching
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "decor",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "decor", is_active: true },
    { resource: "media" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "decor",
    { is_active: true },
    { resource: "media" }
  );

  // --- Hero video
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

  /* ---------------------------
     Decor Service Categories
  --------------------------- */
  const decorCategories = [
    {
      title: "Floral & Table Decor",
      services: [
        { name: "Luxury Floral Arrangements", description: "Elegant centerpiece & aisle florals tailored to your theme." },
        { name: "Table Styling", description: "Curated linens, cutlery, and accent decor for a cohesive atmosphere." },
        { name: "Backdrop Flowers", description: "Custom floral walls and stage florals for photo-perfect elegance." },
      ],
    },
    {
      title: "Lighting & Ambience",
      services: [
        { name: "Mood Lighting", description: "Set the perfect ambiance with color-coordinated stage and floor lights." },
        { name: "Lanterns & Chandeliers", description: "Classic and modern hanging decor for luxurious lighting setups." },
        { name: "LED Installations", description: "Dynamic LED effects for events, concerts, and ceremonies." },
      ],
    },
    {
      title: "Stage & Venue Design",
      services: [
        { name: "Stage Backdrops", description: "Modern, floral, or theme-based stage designs for every occasion." },
        { name: "Draping & Ceiling Work", description: "Elegant draping to soften lighting and enhance visual flow." },
        { name: "Entrance & Aisle Decor", description: "First impressions that leave guests in awe." },
      ],
    },
  ];

  return (
    <div className="decor-page-container">
      {/* === HERO === */}
      <section className="banner-section" aria-label="Decor hero">
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
              preload="metadata"
              onError={() => setVideoUrl(null)}
            />
            <div className="hero-overlay" />

            <motion.div
              className="hero-panel"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
            >
              <h1 className="hero-heading">Decor & Event Design</h1>
              <p className="hero-lead">
                Transform your venue with elegant styling, lighting, and decor artistry.
                Every detail crafted to elevate your occasion.
              </p>
              <div className="hero-actions">
                <button
                  className="cta-button"
                  onClick={() => navigate("/bookings")}
                >
                  Book Decor Service
                </button>
                <button
                  className="cta-alt"
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" })}
                >
                  View Gallery
                </button>
              </div>
            </motion.div>

            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : bannerItems.length && !bannerLoading ? (
          <BannerCards items={bannerItems} title="Decor Showcases" />
        ) : (
          <div className="video-skeleton" />
        )}
      </section>

      {/* === DECOR SERVICES (uses ServiceCategory) === */}
      <motion.section
        className="section decor-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Our Decor Services</h2>
        <p className="section-description">
          From floral designs to atmospheric lighting, our decor experts craft experiences that transform spaces.
        </p>

        <div className="decor-service-category-list">
          {decorCategories.map((cat, idx) => (
            <ServiceCategory key={idx} category={cat} />
          ))}
        </div>
      </motion.section>

      {/* === CREATIVE SHOWCASE === */}
      <section className="section creative-layout" aria-labelledby="transform-heading">
        <motion.div
          className="creative-text"
          initial="hidden"
          whileInView="visible"
          variants={fadeLeft}
        >
          <h3 id="transform-heading">Transform Your Venue</h3>
          <p>
            Our decor artists combine texture, light, and design to create immersive experiences.
            Each project reflects elegance, creativity, and attention to detail.
          </p>
        </motion.div>

        <motion.div
          className="creative-media"
          initial="hidden"
          whileInView="visible"
          variants={fadeRight}
        >
          {mediaLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length ? (
            mediaCards.slice(0, 2).map((m, idx) => (
              <MediaCard key={m.id ?? m._id ?? idx} media={m} />
            ))
          ) : (
            <p className="muted-text">No decor media available.</p>
          )}
        </motion.div>
      </section>

      {/* === GALLERY === */}
      <motion.section
        className="section"
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
      >
        <h2>Decor Highlights</h2>
        <p>
          Explore our latest decor work, where each frame captures a story of elegance and creativity.
        </p>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.slice(0, 6).map((m, idx) => (
                <MediaCard key={m.id ?? m._id ?? idx} media={m} />
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
