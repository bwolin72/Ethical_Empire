// src/components/services/MediaHostingServicePage.jsx
import React, { useEffect, useRef, useState } from "react";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import "./MediaHostingServicePage.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import Services from "../home/Services";

const MediaHostingServicePage = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // === Fetch Hero Video (fallback to banner if none) ===
  useEffect(() => {
    const fetchHeroVideo = async () => {
      try {
        const res = await apiService.getMedia("mediaHostingServicePage", {
          is_active: true,
          file_type: "video/",
          page_size: 1,
        });

        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : res.data;

        if (results.length > 0 && results[0].url?.full) {
          setVideoUrl(results[0].url.full);
        } else {
          setVideoUrl(""); // fallback → banner only
        }
      } catch (error) {
        console.error("Failed to load hero video:", error);
        setVideoUrl(""); // fallback → banner only
      }
    };

    fetchHeroVideo();
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  return (
    <div className="media-hosting-page">
      {/* === Hero Banner or Video === */}
      <section className="hero-banner">
        {videoUrl ? (
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
            />
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </motion.div>
        ) : (
          <BannerCards
            endpoint="mediaHostingServicePage"
            title="Capture & Host with Ethical Precision"
          />
        )}
      </section>

      {/* === Overview Services Section === */}
      <section className="section services-section">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Our Multimedia & Hosting Services</h2>
          <p className="section-description">
            From professional photography to full-scale event hosting, explore
            our multimedia services designed to capture, share, and elevate your
            moments with precision.
          </p>
        </motion.div>
        <Services />
      </section>

      {/* === Creative Media Preview Section === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <motion.div
            className="creative-text"
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="section-subtitle">
              Visual Storytelling & Professional Coverage
            </h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning
              clarity. From cinematic videography to detailed photography and
              reliable hosting — your memories and messages are in expert hands.
            </p>
          </motion.div>

          <motion.div
            className="creative-media"
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <MediaCards
              endpoint="mediaHostingServicePage"
              type="media"
              limit={3}
              fullWidth={false}
              supportPreview={true}
            />
          </motion.div>
        </div>
      </section>

      {/* === Event Hosting Info === */}
      <section className="section event-hosting-section">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Host Your Event with Us</h2>
          <p className="section-description">
            Need a location for your next shoot, seminar, or celebration? We
            provide fully equipped event spaces with lighting, seating, sound,
            and ambiance — ready for recording, streaming, or staging your
            unforgettable moment.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cta-button"
            onClick={() => navigate("/bookings")}
          >
            Book a Venue
          </motion.button>
        </motion.div>
      </section>

      {/* === Full Multimedia Gallery === */}
      <section className="section gallery-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Multimedia Gallery</h2>
        </motion.div>
        <MediaCards
          endpoint="mediaHostingServicePage"
          type="media"
          limit={6}
          fullWidth={true}
          supportPreview={true}
        />
      </section>
    </div>
  );
};

export default MediaHostingServicePage;
