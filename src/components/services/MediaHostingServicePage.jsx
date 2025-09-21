// src/components/services/MediaHostingServicePage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./MediaHostingServicePage.css";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Services from "../home/Services";
import useFetcher from "../../hooks/useFetcher";
import apiService from "../../api/apiService";

// ---------- Helpers ----------
const toArray = (payload) =>
  !payload
    ? []
    : Array.isArray(payload)
    ? payload
    : Array.isArray(payload.data)
    ? payload.data
    : [];

const getMediaUrl = (m) => {
  if (!m) return "";
  const cands = [
    m.url?.full,
    m.url,
    m.video_url,
    m.video_file,
    m.file_url,
    m.file,
    m.src,
    m.path,
    m.secure_url,
  ].filter((x) => typeof x === "string" && x.trim() !== "");
  return cands[0] || "";
};

// ---------- Component ----------
export default function MediaHostingServicePage() {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // ---- Fetch Banner, Videos, Media ----
  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "mediaHostingServicePage", is_active: true },
    { resource: "media" }
  );

  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: mediaRaw, loading: mediaLoading } = useFetcher(
    "media",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "media" }
  );

  // ---- Client Reviews ----
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const fetchTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await apiService.getReviews({ category: "mediaHostingServicePage" });
      setTestimonials(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // ---- Determine Hero Video ----
  useEffect(() => {
    const vids = toArray(videosRaw);
    if (vids.length === 0) {
      if (!videoLoading) setVideoUrl(null);
      return;
    }
    const featured = vids.find((v) => v?.is_featured) ?? vids[0];
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
  const mediaItems = toArray(mediaRaw);

  return (
    <div className="media-hosting-page-container">
      {/* ---------- HERO ---------- */}
      <section className="hero-banner" aria-label="Hero">
        {bannerItems.length > 0 && !bannerLoading ? (
          <BannerCards items={bannerItems} title="Capture & Host with Ethical Precision" />
        ) : videoUrl && !videoLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="video-wrapper"
          >
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
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>
          </motion.div>
        ) : bannerLoading || videoLoading ? (
          <div className="video-placeholder">
            <div className="video-skeleton" />
          </div>
        ) : (
          <p className="muted-text">No hero media available.</p>
        )}
      </section>

      {/* ---------- Services ---------- */}
      <section className="section services-section">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
          <h2 className="section-title">Our Multimedia & Hosting Services</h2>
          <p className="section-description">
            From professional photography to full-scale event hosting, explore our multimedia services designed to capture, share, and elevate your moments with precision.
          </p>
        </motion.div>
        <Services />
      </section>

      {/* ---------- Creative Media ---------- */}
      <section className="section creative-section">
        <div className="creative-layout">
          <motion.div className="creative-text" initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            <h3 className="section-subtitle">Visual Storytelling & Professional Coverage</h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert, Eethmgh Multimedia ensures every moment is captured in stunning clarity. From cinematic videography to detailed photography and reliable hosting — your memories and messages are in expert hands.
            </p>
          </motion.div>
          <motion.div className="creative-media" initial={{ x: 40, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
            {mediaLoading ? Array.from({ length: 3 }).map((_, i) => <MediaSkeleton key={i} />) : mediaItems.length > 0 ? mediaItems.slice(0, 3).map((m, idx) => <MediaCards key={m.id ?? m._id ?? m.url ?? idx} media={m} supportPreview />) : <p className="muted-text">No preview media available.</p>}
          </motion.div>
        </div>
      </section>

      {/* ---------- Event Hosting ---------- */}
      <section className="section event-hosting-section">
        <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="section-title">Host Your Event with Us</h2>
          <p className="section-description">
            Need a location for your next shoot, seminar, or celebration? We provide fully equipped event spaces with lighting, seating, sound, and ambiance — ready for recording, streaming, or staging your unforgettable moment.
          </p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-button" onClick={() => navigate("/bookings")}>
            Book a Venue
          </motion.button>
        </motion.div>
      </section>

      {/* ---------- Multimedia Gallery ---------- */}
      <section className="section gallery-section">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
          <h2 className="section-title">Multimedia Gallery</h2>
        </motion.div>
        {mediaLoading ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />) : mediaItems.length > 0 ? mediaItems.slice(0, 6).map((m, idx) => <MediaCards key={m.id ?? m._id ?? m.url ?? idx} media={m} supportPreview fullWidth />) : <p className="muted-text">No multimedia content available.</p>}
      </section>

      {/* ---------- Client Impressions / Reviews ---------- */}
      <section className="section testimonial-section" aria-live="polite">
        <h2 className="section-title">Client Impressions</h2>
        <div className="testimonial-grid">
          {loadingTestimonials
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="testimonial-card shimmer">
                  <div className="testimonial-text">Loading review...</div>
                  <div className="testimonial-user">Loading...</div>
                </div>
              ))
            : testimonials.length > 0
            ? testimonials.slice(0, 6).map((r, idx) => (
                <div key={r.id ?? r._id ?? idx} className="testimonial-card">
                  <p className="testimonial-text">{r.message ? `"${r.message}"` : '"No comment provided."'}</p>
                  <p className="testimonial-user">— {r.user?.username || "Anonymous"}</p>
                </div>
              ))
            : <p className="muted-text">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
