import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import FadeInSection from "../FadeInSection";
import Services from "./Services";
import NewsletterSignup from "../user/NewsLetterSignup";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import MediaGallery from "../gallery/MediaGallery";

import useFetcher from "../../hooks/useFetcher";
import apiService from "../../api/apiService";
import "./EethmHome.css";

const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (media) => {
  const candidates = [
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
  if (!found && media?.secure_url) return media.secure_url;
  if (!found && media?.public_id && media?.cloud_name) {
    return `https://res.cloudinary.com/${media.cloud_name}/image/upload/${media.public_id}`;
  }
  return found || "";
};

const EethmHome = () => {
  const navigate = useNavigate();
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // === Fetch hero media ===
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

  // === Client reviews (full set) ===
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await apiService.getReviews(); // all reviews
      setReviews(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // === Video handling ===
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (videos.length === 0) {
      if (!videoLoading) setVideoUrl(null);
      return;
    }
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    const src = getMediaUrl(featured);
    setVideoUrl(src || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        try {
          videoRef.current.muted = next;
        } catch (_) {}
      }
      return next;
    });
  };

  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="eethm-home-page">
      {/* === HERO / BANNER SECTION === */}
      <section className="banner-section" aria-label="Hero">
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
              onError={() => {
                console.warn("Hero video failed to load, falling back to BannerCards");
                setVideoUrl(null);
              }}
            />
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-pressed={!isMuted}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : videoLoading ? (
          <div className="video-placeholder" aria-hidden="true">
            <div className="video-skeleton" />
          </div>
        ) : (
          <BannerCards endpoint="home" title="Highlights" />
        )}
      </section>

      {/* === CTA Buttons === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Now
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button secondary"
          onClick={() => setShowNewsletterForm(true)}
        >
          📩 Subscribe
        </motion.button>
      </section>

      {/* === SERVICES === */}
      <FadeInSection>
        <section className="services-page">
          <h2>Explore Eethm_GH Ministrations</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* === MEDIA HIGHLIGHTS === */}
      <FadeInSection>
        <section className="section">
          <h2>Our Media Library</h2>
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : mediaCards.length > 0
            ? mediaCards.slice(0, 6).map((media, idx) => (
                <MediaCard
                  key={media.id ?? media._id ?? media.url ?? idx}
                  media={media}
                />
              ))
            : <p className="muted-text">No media available at the moment.</p>}
        </section>
      </FadeInSection>

      {/* === CLIENT REVIEWS === */}
      <FadeInSection>
        <section className="reviews-section">
          <h2>What Our Clients Say</h2>
          {loadingReviews
            ? <p>Loading reviews…</p>
            : reviews.length > 0
            ? (
              <div className="reviews-container">
                {reviews.slice(0,6).map((r, idx) => (
                  <div key={r.id ?? r._id ?? idx} className="review-card">
                    <p>"{r.comment || r.message}"</p>
                    <p>— {r.name || r.user?.username || "Anonymous"}</p>
                  </div>
                ))}
              </div>
            )
            : <p className="muted-text">No reviews yet.</p>}
        </section>
      </FadeInSection>

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
              type="button"
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
