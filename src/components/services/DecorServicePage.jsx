// src/components/services/DecorServicePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./decor.css";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import BannerCards from "../context/BannerCards";
import useFetcher from "../../hooks/useFetcher"; // unified hook
import apiService from "../../api/apiService";
import Services from "../home/Services";

const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getMediaUrl = (media) => {
  if (!media) return "";
  // check common fields used across your APIs and backups
  const candidates = [
    media.url?.full,
    media.url,
    media.video_url,
    media.video_file,
    media.file_url,
    media.file,
    media.src,
    media.path,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim() !== "");
  // if cloudinary-like object, handle nested cases:
  if (!found && media?.secure_url) return media.secure_url;
  if (!found && media?.public_id && media?.cloud_name) {
    // example Cloudinary URL fallback (adjust as needed)
    return `https://res.cloudinary.com/${media.cloud_name}/image/upload/${media.public_id}`;
  }
  return found || "";
};

const DecorServicePage = () => {
  const navigate = useNavigate();

  // === Fetch media using unified hook ===
  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "decor",
    { is_active: true },
    { resource: "media" }
  );

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const [videoUrl, setVideoUrl] = useState(null); // null = "no video yet / fallback"
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // === Fetch hero/event video using unified hook ===
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "decor",
    { is_active: true },
    { resource: "videos" }
  );

  // === Testimonials ===
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

  // Normalize the videos result and pick a featured one if present
  useEffect(() => {
    const videos = toArray(videosRaw);
    if (videos.length === 0) {
      // if still loading, keep null to avoid premature fallback rendering
      if (!videoLoading) setVideoUrl(null);
      return;
    }

    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    const src = getMediaUrl(featured);
    if (src) {
      setVideoUrl(src);
    } else {
      setVideoUrl(null);
    }
    // If you create object URLs elsewhere, consider revoking them here on cleanup
  }, [videosRaw, videoLoading]);

  // toggle mute (compute new value and apply consistently)
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      // prefer letting React update the <video muted={isMuted} /> prop,
      // but also set DOM property to keep player in sync immediately
      if (videoRef.current) {
        try {
          videoRef.current.muted = next;
        } catch (_) {}
      }
      return next;
    });
  };

  // Helper arrays
  const mediaCards = toArray(mediaCardsRaw);

  return (
    <div className="decor-page-container">
      {/* === Hero Banner or Video === */}
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
                // if video fails, fallback to null so BannerCards shows
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
          // optional: skeleton or lightweight placeholder while video loads
          <div className="video-placeholder" aria-hidden="true">
            <div className="video-skeleton" />
          </div>
        ) : (
          // no video available -> show BannerCards
          <BannerCards endpoint="decor" title="Decor Showcases" />
        )}
      </section>

      {/* === CTA Button === */}
      <section className="cta-section">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
          aria-label="Book decor service"
        >
          Book Decor Service
        </motion.button>
      </section>

      {/* === Shared Decor Services === */}
      <section className="section">
        <h2 className="section-title">Our Decor Services</h2>
        <p className="section-description">
          From elegant floral arrangements to immersive lighting, explore the
          services that bring your event to life.
        </p>
        <Services />
      </section>

      {/* === Venue Transformation Preview === */}
      <section className="section creative-layout" aria-labelledby="transform-heading">
        <div className="creative-text">
          <h3 id="transform-heading">Transform Your Venue</h3>
          <p>
            Ethical Multimedia creates immersive, elegant decor tailored to your
            theme. From romantic weddings to vibrant cultural events, we handle
            every detail—so your space becomes unforgettable.
          </p>
        </div>
        <div className="creative-media">
          {mediaLoading ? (
            Array.from({ length: 2 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length > 0 ? (
            mediaCards.slice(0, 2).map((media, idx) => (
              <MediaCard
                key={media.id ?? media._id ?? media.url ?? idx}
                media={media}
              />
            ))
          ) : (
            <p className="muted-text">No media available.</p>
          )}
        </div>
      </section>

      {/* === Decor Gallery === */}
      <section className="section">
        <h2 className="section-title">Decor Highlights</h2>
        <p className="section-description">
          Every event is a canvas—we decorate with purpose, elegance, and
          emotion. Discover the beauty of our decor setups in the gallery below.
        </p>
        <div className="card-grid">
          {mediaLoading ? (
            Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
          ) : mediaCards.length > 0 ? (
            mediaCards.slice(0, 6).map((media, idx) => (
              <MediaCard
                key={media.id ?? media._id ?? media.url ?? idx}
                media={media}
              />
            ))
          ) : (
            <p className="muted-text">No decor media available at the moment.</p>
          )}
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section" aria-live="polite">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {loadingTestimonials ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="testimonial-card shimmer">
                <div className="testimonial-text">Loading review...</div>
                <div className="testimonial-user">Loading...</div>
              </div>
            ))
          ) : testimonials.length > 0 ? (
            testimonials.slice(0, 6).map((review, idx) => (
              <div
                key={review.id ?? review._id ?? review.message ?? idx}
                className="testimonial-card"
              >
                <p className="testimonial-text">
                  {review.message ? `"${review.message}"` : '"No comment provided."'}
                </p>
                <p className="testimonial-user">
                  — {review.user?.username || "Anonymous"}
                </p>
              </div>
            ))
          ) : (
            <p className="muted-text">No reviews yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DecorServicePage;
