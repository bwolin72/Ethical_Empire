// src/components/services/MediaHostingServicePage.jsx
import React, { useEffect, useRef, useState } from "react";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import "./MediaHostingServicePage.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import Services from "../home/Services"; // ✅ shared Services component

const MediaHostingServicePage = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

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
          setVideoUrl("/mock/hero-video.mp4"); // fallback if no API video
        }
      } catch (error) {
        console.error("Failed to load hero video:", error);
        setVideoUrl("/mock/hero-video.mp4"); // fallback on error
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
          <div className="video-wrapper">
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
          </div>
        ) : (
          <BannerCards
            endpoint="mediaHostingServicePage"
            title="Capture & Host with Ethical Precision"
          />
        )}
      </section>

      {/* === Shared Services Section === */}
      <section className="section services-section">
        <h2 className="section-title">Our Multimedia & Hosting Services</h2>
        <p className="section-description">
          From professional photography to full-scale event hosting, explore all
          our multimedia services designed to capture and share your moments.
        </p>
        <Services /> {/* ✅ shared component */}
      </section>

      {/* === Creative Media Preview === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">
              Visual Storytelling & Professional Coverage
            </h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning
              clarity. From cinematic videography to detailed photography and
              reliable hosting — your memories and messages are in expert hands.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards
              endpoint="mediaHostingServicePage"
              type="media"
              limit={3}
              fullWidth={false}
              supportPreview={true}
            />
          </div>
        </div>
      </section>

      {/* === Hosting Venue Info === */}
      <section className="section event-hosting-section">
        <h2 className="section-title">Hosting Event Place</h2>
        <p className="section-description">
          Need a location for your next shoot, seminar, or celebration? We offer
          fully equipped event spaces with lighting, seating, sound, and
          ambiance — ready for recording, streaming, or staging your
          unforgettable moment.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="cta-button"
          onClick={() => navigate("/bookings")}
        >
          Book a Venue
        </motion.button>
      </section>

      {/* === Full Gallery === */}
      <section className="section">
        <h2 className="section-title">Multimedia Gallery</h2>
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
