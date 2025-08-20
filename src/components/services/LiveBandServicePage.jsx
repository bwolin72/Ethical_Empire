// src/components/services/LiveBandServicePage.jsx
import React, { useEffect, useState, useRef } from "react";
import "./liveband.css";
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import apiService from "../../api/apiService";
import Services from "../home/Services"; // ✅ import shared Services component

// === Animation Variants (shared) ===
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08 },
  }),
};

// === Robust media URL resolver ===
const getMediaUrl = (media) => {
  if (!media) return "";
  const val =
    (media?.url && (media.url.full ?? media.url)) ??
    media?.video_url ??
    media?.video_file ??
    media?.file_url ??
    media?.file ??
    "";
  return typeof val === "string" ? val : String(val ?? "");
};

const LiveBandServicePage = () => {
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // === Fetch Content (Reviews + Video) ===
  useEffect(() => {
    let mounted = true;

    const fetchContent = async () => {
      try {
        const [reviewRes, videoRes] = await Promise.all([
          apiService.getReviews(),
          apiService.getVideos({
            endpoint: "LiveBandServicePage",
            is_active: true,
          }),
        ]);

        // Normalize testimonials
        const rawReviews = Array.isArray(reviewRes?.data) ? reviewRes.data : [];
        const normReviews = rawReviews.map((r) => ({
          id: r.id ?? r._id ?? undefined,
          text: r.message ?? r.comment ?? r.text ?? r.content ?? "",
          author:
            r.user?.username ??
            r.reviewer_name ??
            r.name ??
            r.user_name ??
            "Anonymous",
        }));
        if (mounted) setTestimonials(normReviews);

        // Pick featured video
        const rawVideos = Array.isArray(videoRes?.data) ? videoRes.data : [];
        const featured = rawVideos.find((v) => v?.is_featured) ?? rawVideos[0];
        const src = getMediaUrl(featured);
        if (mounted) setVideoUrl(src || "");
      } catch (error) {
        console.error("Failed to load content:", error);
        if (mounted) setErrorMsg("Failed to load reviews or video.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchContent();
    return () => {
      mounted = false;
    };
  }, []);

  // === Sync video mute state ===
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = isMuted;
      } catch {}
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="liveband-page">
      {/* === Hero Banner or Video === */}
      <section className="banner-section">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              className="hero-banner-image"
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              onError={() => setVideoUrl("/fallback-banner.jpg")}
            />
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute background video" : "Mute background video"}
              type="button"
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <div className="hero-overlay" />
            <h1 className="hero-title">Experience the Rhythm of Elegance</h1>
            <p className="hero-subtitle">
              Professional Live Bands for Unforgettable Events
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="cta-button hero-button"
              onClick={() => navigate("/bookings")}
              type="button"
            >
              Book a Live Band
            </motion.button>
          </>
        ) : (
          <>
            <div className="hero-overlay" />
            <h1 className="hero-title">Experience the Rhythm of Elegance</h1>
            <p className="hero-subtitle">
              Professional Live Bands for Unforgettable Events
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="cta-button hero-button"
              onClick={() => navigate("/bookings")}
              type="button"
            >
              Book a Live Band
            </motion.button>

            <div className="banner-cards-wrapper">
              <BannerCards
                endpoint="LiveBandServicePage"
                title="Live Band Highlights"
              />
            </div>
          </>
        )}
      </section>

      {/* === Services Offered (reusing global Services) === */}
      <section className="section services-section">
        <h2 className="section-title">Live Band Services</h2>
        <p className="section-description">
          From intimate acoustic duos to full orchestras — choose your sound.
        </p>

        {/* ✅ Shared services component */}
        <Services />
      </section>

      {/* === Immersive Preview === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">Immersive Musical Moments</h3>
            <p className="section-description">
              Whether you're planning a wedding, corporate gala, or private soirée,
              our live bands deliver timeless melodies and unmatched ambiance that
              elevate your event to extraordinary.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards
              endpoint="LiveBandServicePage"
              fullWidth={false}
              title=""
            />
          </div>
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section" aria-live="polite">
        <h2 className="section-title">Client Reviews</h2>
        <p className="section-description">
          Hear what our clients say about their elevated musical experiences.
        </p>
        <div className="testimonial-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="testimonial-card shimmer" />
            ))
          ) : errorMsg ? (
            <p
              className="section-description"
              style={{ textAlign: "center", opacity: 0.7 }}
            >
              {errorMsg}
            </p>
          ) : testimonials.length > 0 ? (
            testimonials.slice(0, 6).map((review, index) => (
              <motion.div
                key={review.id ?? index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                custom={index}
                viewport={{ once: true }}
              >
                <Card className="testimonial-card">
                  <CardContent className="card-content">
                    <p className="testimonial-text">"{review.text}"</p>
                    <p className="testimonial-user">— {review.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p
              className="section-description"
              style={{ textAlign: "center", opacity: 0.7 }}
            >
              No client reviews available yet.
            </p>
          )}
        </div>
      </section>

      {/* === Full Media Gallery === */}
      <section className="section media-gallery-section">
        <h2 className="section-title">Full Gallery</h2>
        <MediaCards endpoint="LiveBandServicePage" fullWidth={true} title="" />
      </section>
    </div>
  );
};

export default LiveBandServicePage;
