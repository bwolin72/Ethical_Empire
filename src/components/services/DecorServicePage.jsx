// src/components/services/DecorServicePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./decor.css";

import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import BannerCards from "../context/BannerCards";
import useFetcher from "../../hooks/useFetcher";
import apiService from "../../api/apiService";
import Services from "../home/Services";

// ------------------ helpers ------------------
const toArray = (payload) =>
  !payload ? [] : Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];

const getMediaUrl = (m) => {
  if (!m) return "";
  const candidates = [
    m.url?.full,
    m.url,
    m.video_url,
    m.video_file,
    m.file_url,
    m.file,
    m.src,
    m.path,
    m.secure_url,
  ].filter((c) => typeof c === "string" && c.trim() !== "");
  return candidates[0] || "";
};

// ------------------ component ------------------
export default function DecorServicePage() {
  const navigate = useNavigate();

  // === Hero: Banner images
  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "decor", is_active: true },
    { resource: "media" }
  );

  // === Fallback video if no banner
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "decor",
    { is_active: true },
    { resource: "videos" }
  );
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Decor gallery media
  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "decor",
    { is_active: true },
    { resource: "media" }
  );

  // Testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await apiService.getReviews({ category: "decor" });
      setTestimonials(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // --- Determine fallback video
  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length) {
      if (!videoLoading) setVideoUrl(null);
      return;
    }
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

  const bannerItems = toArray(bannerRaw);
  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="decor-page-container">
      {/* === Hero Section === */}
      <section className="banner-section" aria-label="Hero">
        {bannerItems.length && !bannerLoading ? (
          <BannerCards items={bannerItems} title="Decor Showcases" />
        ) : videoUrl && !videoLoading ? (
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
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : bannerLoading || videoLoading ? (
          <div className="video-skeleton" />
        ) : (
          <p className="muted-text">No hero media available.</p>
        )}
      </section>

      {/* === CTA === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* === Decor Services === */}
      <section className="section">
        <h2>Our Decor Services</h2>
        <p>
          From elegant floral arrangements to immersive lighting, explore the
          services that bring your event to life.
        </p>
        <Services />
      </section>

      {/* === Venue Transformation === */}
      <section className="section creative-layout" aria-labelledby="transform-heading">
        <div className="creative-text">
          <h3 id="transform-heading">Transform Your Venue</h3>
          <p>
            Eethmgh Multimedia creates immersive, elegant decor tailored to your
            theme. From romantic weddings to vibrant cultural events, we handle
            every detail—so your space becomes unforgettable.
          </p>
        </div>
        <div className="creative-media">
          {mediaLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length ? (
            mediaCards.slice(0, 2).map((m, idx) => <MediaCard key={m.id ?? m._id ?? idx} media={m} />)
          ) : (
            <p className="muted-text">No media available.</p>
          )}
        </div>
      </section>

      {/* === Decor Gallery === */}
      <section className="section">
        <h2>Decor Highlights</h2>
        <p>
          Every event is a canvas—we decorate with purpose, elegance, and
          emotion. Discover the beauty of our decor setups in the gallery below.
        </p>
        <div className="card-grid">
          {mediaLoading ? (
            Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length ? (
            mediaCards.slice(0, 6).map((m, idx) => <MediaCard key={m.id ?? m._id ?? idx} media={m} />)
          ) : (
            <p className="muted-text">No decor media available at the moment.</p>
          )}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section" aria-live="polite">
        <h2>Client Impressions</h2>
        <div className="testimonial-grid">
          {loadingTestimonials
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="testimonial-card shimmer">
                  <div className="testimonial-text">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.length
            ? testimonials.slice(0, 6).map((r, idx) => (
                <div key={r.id ?? r._id ?? idx} className="testimonial-card">
                  <p className="testimonial-text">
                    {r.message ? `"${r.message}"` : '"No comment provided."'}
                  </p>
                  <p className="testimonial-user">— {r.user?.username || "Anonymous"}</p>
                </div>
              ))
            : <p className="muted-text">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
