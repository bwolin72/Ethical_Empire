// frontend/src/components/services/LiveBandServicePage.jsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import ServicesCategory from "./ServiceCategory";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import useFetcher from "../../hooks/useFetcher";
import "./liveband.css";

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

  return (
    <div className="liveband-page-container">
      {/* === HERO SECTION === */}
      <section className="banner-section" aria-label="Live Band Hero">
        {videoUrl && !videoLoading ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setVideoUrl(null)}
            />
            <div className="video-overlay" />
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="hero-heading">Live Band & Performances</h1>
              <p className="hero-subtext">
                Feel the rhythm. From acoustic vibes to full orchestral experiences —
                Eethm Live Band brings sound to life with heart, passion, and precision.
              </p>
              <div className="hero-actions">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="cta-button"
                  onClick={() => navigate("/bookings")}
                >
                  Book a Live Band
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="cta-alt"
                  onClick={() =>
                    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
                  }
                >
                  View Performances
                </motion.button>
              </div>
            </motion.div>

            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : videoLoading ? (
          <div className="video-placeholder">
            <div className="video-skeleton" />
          </div>
        ) : (
          <BannerCards endpoint="liveband" title="Live Band Highlights" />
        )}
      </section>

      {/* === SERVICES CATEGORY === */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Our Live Band Services</h2>
        <p className="section-lead">
          Whether it’s a wedding, concert, or corporate gala, our bands deliver sonic excellence.
          Explore curated packages crafted for your event.
        </p>
        <ServicesCategory category="liveband" />
      </motion.section>

      {/* === BEHIND THE SCENES === */}
      <section className="section behind-scenes" aria-label="Behind the Scenes">
        <div className="behind-overlay" />
        <motion.div
          className="behind-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2>Behind the Sound</h2>
          <p>
            Go beyond the spotlight — our technicians, sound engineers, and stage artists
            ensure flawless performance through seamless production and passion-driven artistry.
          </p>
          <motion.button
            whileHover={{ scale: 1.07 }}
            className="cta-outline"
            onClick={() => navigate("/about")}
          >
            Learn About Our Team
          </motion.button>
        </motion.div>
      </section>

      {/* === BAND SHOWCASE === */}
      <motion.section
        className="section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Performance Highlights</h2>
        <p className="section-lead">
          Discover our most iconic performances — captured live and full of energy.
        </p>

        <div className="card-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0
            ? mediaCards.slice(0, 6).map((m, i) => (
                <MediaCard key={m.id ?? m._id ?? i} media={m} />
              ))
            : <p className="muted-text center-text">No live band media available yet.</p>}
        </div>
      </motion.section>

      {/* === REVIEWS === */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Impressions"
          description="Hear what audiences say about our live performances"
        >
          <Reviews limit={6} hideForm={true} category="liveband" />
        </ReviewsLayout>
      </FadeInSection>
    </div>
  );
}
