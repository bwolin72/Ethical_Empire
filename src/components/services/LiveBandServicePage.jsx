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

import "./liveband.css";

/* ---------- Motion Variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

/* ---------- Component ---------- */
export default function LiveBandServicePage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  /* ---------- Backend Fetchers ---------- */
  const { data: bannerData, loading: bannerLoading } = useFetcher(
    "mediafiles",
    "LiveBandServicePage",
    { type: "banner", is_active: true },
    { resource: "media" }
  );

  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "LiveBandServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: mediaRaw, loading: mediaLoading } = useFetcher(
    "mediafiles",
    "LiveBandServicePage",
    { type: "media", is_active: true },
    { resource: "media" }
  );

  const [videoUrl, setVideoUrl] = useState(null);

  /* ---------- Video Setup ---------- */
  useEffect(() => {
    if (videosRaw && videosRaw.length > 0) {
      const featured = videosRaw.find((v) => v.is_featured) ?? videosRaw[0];
      setVideoUrl(featured?.video_url || featured?.url || null);
    }
  }, [videosRaw]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  /* ---------- Local Static Service Categories ---------- */
  const liveBandCategories = [
    {
      name: "Corporate & Luxury Events",
      description:
        "Live music that defines class — perfect for corporate galas, product launches, and executive retreats.",
      icon: "🎤",
    },
    {
      name: "Weddings & Private Celebrations",
      description:
        "From soulful bridal walks to energetic receptions, our live band brings your love story to life.",
      icon: "💍",
    },
    {
      name: "Concerts & Festivals",
      description:
        "Professional setups for large-scale performances, festivals, and artist collaborations across Ghana.",
      icon: "🎶",
    },
  ];

  return (
    <div className="liveband-page-container">
      {/* ---------- HERO SECTION ---------- */}
      <section className="liveband-hero-section" aria-label="Live Band Hero">
        <BannerCards
          endpoint="LiveBandServicePage"
          type="banner"
          loading={bannerLoading}
        />

        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="hero-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
          />
        )}

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
            Experience Ghana’s most electrifying live performances — from
            weddings to festivals, our musicians bring rhythm, artistry, and
            passion to every stage.
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
                document
                  .querySelector(".gallery-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Watch Performances
            </button>
          </div>
        </motion.div>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </section>

      {/* ---------- SERVICE CATEGORIES ---------- */}
      <motion.section
        className="section liveband-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Our Live Band Services</h2>
        <p className="section-description">
          Explore immersive music experiences crafted for elegant weddings,
          corporate gatherings, and large-scale concerts.
        </p>
        <div className="liveband-category-grid">
          {liveBandCategories.map((cat, i) => (
            <motion.div key={i} className="liveband-category-card" variants={zoomIn}>
              <div className="category-icon">{cat.icon}</div>
              <ServiceCategory category={cat} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ---------- VIDEO GALLERY ---------- */}
      <motion.section
        className="section video-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Performance Videos</h2>
        <VideoGallery endpoint="LiveBandServicePage" />
      </motion.section>

      {/* ---------- IMAGE GALLERY ---------- */}
      <motion.section
        className="section gallery-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
      >
        <h2>Performance Highlights</h2>
        <p>
          Discover our most memorable performances — captivating stages filled
          with soul, rhythm, and Ghanaian excellence.
        </p>
        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MediaSkeleton key={i} />
              ))
            : mediaRaw?.slice(0, 6).map((m, i) => (
                <MediaCard key={m.id ?? i} media={m} />
              ))}
        </div>
      </motion.section>

      {/* ---------- REVIEWS ---------- */}
      <ReviewsLayout
        title="Client Impressions"
        description="What our audiences say about Eethm Live Band"
      >
        <Reviews limit={6} hideForm category="LiveBandServicePage" />
      </ReviewsLayout>
    </div>
  );
}
