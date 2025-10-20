import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import VideoGallery from "../videos/VideoGallery";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import Services from "../services/Services";
import ReviewsLayout from "../user/ReviewsLayout";
import Reviews from "../user/Reviews";
import useFetcher from "../../hooks/useFetcher";

import josephImg from "../../assets/team/joseph.jpg";
import euniceImg from "../../assets/team/eunice.png";

import "./About.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_VIDEO_2 = "/mock/hero-video2.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const About = () => {
  const navigate = useNavigate();

  // ===== Fetch Dynamic Content =====
  const { data: videos = [], loading: vLoad } = useFetcher("videos", "about");
  const { data: media = [], loading: mLoad } = useFetcher("media", "about");
  const { data: banners = [], loading: bLoad } = useFetcher("promotions", "about");

  // ===== Prepare Hero Videos =====
  const heroVideos =
    Array.isArray(videos) && videos.length >= 2
      ? videos.slice(0, 2)
      : [
          { url: { full: LOCAL_FALLBACK_VIDEO }, file_type: "video/mp4" },
          { url: { full: LOCAL_FALLBACK_VIDEO_2 }, file_type: "video/mp4" },
        ];

  // ===== Media & Gallery Fallback =====
  const galleryItems = [...(videos || []), ...(media || [])].filter(Boolean);
  if (galleryItems.length === 0) {
    galleryItems.push({ url: { full: LOCAL_FALLBACK_IMAGE }, file_type: "image/jpeg" });
  }

  return (
    <div className="about-page">
      {/* === HERO SECTION (Two Videos) === */}
      <section className="about-hero-section">
        <div className="hero-video-grid">
          {heroVideos.map((vid, i) => (
            <video
              key={i}
              src={vid?.url?.full}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="hero-video"
            />
          ))}
        </div>

        <div className="hero-overlay">
          <h1 className="hero-title">Eethm Multimedia GH</h1>
          <p className="hero-subtitle">Live Band • Catering • Multimedia • Décor Excellence</p>
          <button className="btn-primary" onClick={() => navigate("/bookings")}>
            Book Now
          </button>
        </div>
      </section>

      {/* === WHO WE ARE === */}
      <section className="about-who-we-are">
        <div className="split-layout">
          <div className="intro-text">
            <h2>Who We Are</h2>
            <p>
              At <strong>Eethm Multimedia GH</strong>, we’re passionate about crafting unforgettable
              experiences — from soulful live band ministrations to top-tier catering, multimedia
              production, and elegant décor. Our mission is to inspire joy, foster connection, and
              celebrate life’s moments with authenticity and style.
            </p>
            <button className="btn-secondary" onClick={() => navigate("/services")}>
              Discover Our Work →
            </button>
          </div>

          <div className="intro-media">
            <img src={LOCAL_FALLBACK_IMAGE} alt="Eethm Multimedia team at work" loading="lazy" />
          </div>
        </div>
      </section>

      {/* === HIGHLIGHTS === */}
      <section className="about-banners">
        <h2>Our Highlights</h2>
        {bLoad ? (
          <p>Loading highlights…</p>
        ) : (
          <div className="banner-wrapper">
            <BannerCards endpointKey="about" title="Highlights" />
          </div>
        )}
      </section>

      {/* === WHAT WE DO === */}
      <section className="about-navy-section">
        <div className="services-inner">
          <h2>What We Do</h2>
          <p className="services-tagline">
            From live entertainment to multimedia production, we bring creativity, passion, and
            precision to every detail.
          </p>
          <Services />
        </div>
      </section>

      {/* === TEAM === */}
      <section className="about-team">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {[
            { name: "Joseph", role: "Event Manager", img: josephImg },
            { name: "Eunice", role: "Creative Director", img: euniceImg },
          ].map((member, idx) => (
            <motion.div
              key={member.name + idx}
              className="team-card"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
            >
              <img src={member.img} alt={member.name} loading="lazy" />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === PARTNERS === */}
      <section className="about-partners">
        <h2>Our Partners</h2>
        <div className="partners-logos">
          {["Partner 1", "Partner 2", "Partner 3"].map((p, i) => (
            <motion.div
              key={p + i}
              className="partner-logo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {p}
            </motion.div>
          ))}
        </div>
      </section>

      {/* === GALLERY === */}
      <section className="about-gallery">
        <h2>Gallery Showcase</h2>
        {!mLoad && (
          <div style={{ marginBottom: "1.5rem" }}>
            <MediaCards endpointKey="about" resourceType="media" />
          </div>
        )}
        <MediaGallery items={galleryItems} />
      </section>

      {/* === REVIEWS === */}
      <section className="reviews-layout">
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our services"
        >
          <Reviews limit={6} hideForm />
        </ReviewsLayout>
      </section>
    </div>
  );
};

export default About;
