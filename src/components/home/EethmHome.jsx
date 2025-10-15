// frontend/src/components/home/EethmHome.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FadeInSection from "../FadeInSection";
import Services from "../services/Services"; // ✅ Updated import path
import NewsletterSignup from "../user/NewsLetterSignup";
import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import useFetcher from "../../hooks/useFetcher";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import "./EethmHome.css";

// --- Helpers ---
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (media) => {
  const candidates = [
    media?.secure_url,
    media?.url?.full,
    media?.url,
    media?.video_url,
    media?.video_file,
    media?.file_url,
    media?.file,
    media?.src,
    media?.path,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim() !== "");
  if (!found && media?.public_id && media?.cloud_name) {
    return `https://res.cloudinary.com/${media.cloud_name}/image/upload/${media.public_id}`;
  }
  return found || "";
};

const EethmHome = () => {
  const navigate = useNavigate();
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // --- Fetch hero videos and media cards ---
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "home",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "home",
    { is_active: true },
    { resource: "media" }
  );

  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length && !videoLoading) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured) || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="eethm-home-page">
      {/* === HERO SECTION === */}
      <section className="video-hero-section">
        {videoUrl && !videoLoading ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="background-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <div className="overlay-gradient" />
            <motion.div
              className="overlay-content"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title gradient-text">
                Crafting Experiences with Eethm_GH
              </h1>
              <p className="hero-subtitle">
                Events | Multimedia | Live Band | Lighting | Decor
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  Book Now
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNewsletterForm(true)}
                >
                  Subscribe
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
        ) : (
          <BannerCards endpoint="home" title="Highlights" />
        )}
      </section>

      {/* === ABOUT SECTION === */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="about-content">
          <h2>About Eethm Multimedia GH</h2>
          <p>
            We are the creative heartbeat of Ethical Empire — delivering
            exceptional multimedia, event, and entertainment services across
            Ghana. From soulful live bands and vibrant lighting to cinematic
            videography and décor design, we make every moment unforgettable.
          </p>
        </div>
      </motion.section>

      {/* === SERVICES SECTION === */}
      <motion.section
        className="content-section"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="section-header">Explore Our Core Services</h2>
        <Services />
      </motion.section>

      {/* === MEDIA GALLERY === */}
      <motion.section
        className="media-cards-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="media-cards-title">Our Media Highlights</h2>
        <div className="media-cards-scroll-wrapper">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0 ? (
                mediaCards.slice(0, 6).map((media, idx) => (
                  <MediaCard
                    key={media.id ?? media._id ?? idx}
                    media={media}
                  />
                ))
              ) : (
                <p className="muted-text">No media available at the moment.</p>
              )}
        </div>
      </motion.section>

      {/* === REVIEWS === */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <ReviewsLayout
          title="What Our Clients Say"
          description="Hear from people who’ve experienced the Eethm touch"
        >
          <Reviews limit={6} hideForm />
        </ReviewsLayout>
      </motion.section>

      {/* === NEWSLETTER MODAL === */}
      {showNewsletterForm && (
        <div
          className="newsletter-modal-backdrop"
          onClick={() => setShowNewsletterForm(false)}
        >
          <div
            className="newsletter-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button
              className="newsletter-close-btn"
              onClick={() => setShowNewsletterForm(false)}
            >
              &times;
            </button>
            <NewsletterSignup />
          </div>
        </div>
      )}
    </div>
  );
};

export default EethmHome;
