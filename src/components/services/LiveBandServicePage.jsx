// src/components/services/LiveBandServicePage.jsx
import React, { useEffect, useState, useRef } from "react";
import "./liveband.css";
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import apiService from "../../api/apiService";

// === Animation Variants ===
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

  const [videoUrl, setVideoUrl] = useState("/videos/liveband-fallback.mp4"); // ✅ fallback local video
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
          id: r.id ?? r._id,
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
        if (mounted && src) setVideoUrl(src);
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
      {/* === Hero Banner / Video === */}
      <section className="banner-section">
        <video
          ref={videoRef}
          className="hero-banner-image"
          src={videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
        />
        <div className="hero-overlay" />
        <button
          className="mute-button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute background video" : "Mute background video"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <div className="hero-text">
          <h1 className="hero-title">Experience the Rhythm of Elegance</h1>
          <p className="hero-subtitle">
            Professional Live Bands for Unforgettable Events
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="cta-button hero-button"
            onClick={() => navigate("/bookings")}
          >
            Book a Live Band
          </motion.button>
        </div>
      </section>

      {/* === Why Choose Us === */}
      <section className="section highlights-section">
        <h2 className="section-title">Why Choose Our Live Band?</h2>
        <div className="highlight-grid">
          {[
            { icon: "🎤", title: "Professional Vocalists", text: "Talented singers who adapt to any genre." },
            { icon: "🎸", title: "Versatile Repertoire", text: "From Afrobeat & Highlife to Jazz, Gospel & Reggae." },
            { icon: "🥁", title: "Dynamic Presence", text: "Energy that keeps your guests entertained all night." },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={index}
              viewport={{ once: true }}
              className="highlight-card"
            >
              <div className="highlight-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.div>
          ))}
        </div>
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
            <MediaCards endpoint="LiveBandServicePage" fullWidth={false} title="" />
          </div>
        </div>
      </section>

      {/* === Testimonials === */}
      <section className="section testimonial-section" aria-live="polite">
        <h2 className="section-title">Client Reviews</h2>
        <div className="testimonial-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="testimonial-card shimmer" />
            ))
          ) : errorMsg ? (
            <p className="section-description center-text">{errorMsg}</p>
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
                  <CardContent>
                    <p className="testimonial-text">"{review.text}"</p>
                    <p className="testimonial-user">— {review.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <p className="section-description center-text">
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

      {/* === Final CTA === */}
      <section className="section final-cta">
        <h2 className="section-title">Make Your Event Unforgettable</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book the Live Band Today
        </motion.button>
      </section>
    </div>
  );
};

export default LiveBandServicePage;
