// frontend/src/pages/About.jsx
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
import FadeInSection from "../FadeInSection";
import useFetcher from "../../hooks/useFetcher";

import josephImg from "../../assets/team/joseph.jpg";
import euniceImg from "../../assets/team/eunice.png";

import "./About.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const About = () => {
  const navigate = useNavigate();

  // ===== Fetch Data =====
  const { data: videos = [], loading: vLoad } = useFetcher("videos", "about");
  const { data: media = [], loading: mLoad } = useFetcher("media", "about");
  const { data: banners = [], loading: bLoad } = useFetcher("promotions", "about");

  // ===== Hero Video =====
  const heroVideo =
    Array.isArray(videos) && videos.length > 0
      ? videos[0]
      : { url: { full: LOCAL_FALLBACK_VIDEO }, file_type: "video/mp4" };

  // ===== Gallery Fallback =====
  const galleryItems = [...(Array.isArray(videos) ? videos : []), ...(Array.isArray(media) ? media : [])].filter(Boolean);
  if (galleryItems.length === 0) {
    galleryItems.push({
      url: { full: LOCAL_FALLBACK_IMAGE },
      file_type: "image/jpeg",
    });
  }

  return (
    <div className="about-page">
      {/* === HERO === */}
      <section className="about-hero-section">
        <VideoGallery
          videos={[heroVideo]}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Eethm Multimedia GH"
          subtitle="Live Band • Catering • Multimedia • Décor Excellence"
          actions={[
            {
              label: "Book Now",
              onClick: () => navigate("/bookings"),
              className: "btn-primary",
            },
          ]}
        />
      </section>

      {/* === WHO WE ARE (Gold–Burgundy) === */}
      <FadeInSection className="fade-delay-1">
        <section className="about-who-we-are">
          <div className="split-layout">
            <div className="intro-text">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Who We Are
              </motion.h2>

              <p>
                At <strong>Eethm Multimedia GH</strong>, we’re passionate about crafting unforgettable experiences —
                from soulful live band ministrations to top-tier catering, multimedia production, and elegant décor.
                Our mission is to inspire joy, foster connection, and celebrate life’s moments with authenticity and style.
              </p>

              <button
                className="btn-secondary"
                onClick={() => navigate("/services")}
                aria-label="Discover our work"
              >
                Discover Our Work →
              </button>
            </div>

            <div className="intro-media" aria-hidden="false">
              <img
                src={LOCAL_FALLBACK_IMAGE}
                alt="Eethm Multimedia team at work"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* === HIGHLIGHTS (Neutral card area with BannerCards) === */}
      <FadeInSection className="fade-delay-2">
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
      </FadeInSection>

      {/* === OUR MISSION / WHAT WE DO (Navy–Gold) === */}
      <FadeInSection className="fade-delay-3">
        <section className="about-services about-navy-section">
          <div className="services-inner">
            <h2>What We Do</h2>
            <p className="services-tagline">
              From live entertainment to multimedia production, we bring creativity, passion, and precision to every detail.
            </p>

            {/* Services component renders categorized service cards */}
            <Services />
          </div>
        </section>
      </FadeInSection>

      {/* === TEAM (Burgundy–Gold) === */}
      <FadeInSection className="fade-delay-4">
        <section className="about-team">
          <h2>Meet Our Team</h2>

          <div className="team-grid" role="list">
            {[
              { name: "Joseph", role: "Event Manager", img: josephImg },
              { name: "Eunice", role: "Creative Director", img: euniceImg },
            ].map((member, idx) => (
              <motion.div
                key={member.name + idx}
                className="team-card"
                role="listitem"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <img src={member.img} alt={member.name} loading="lazy" />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* === PARTNERS (subtle cards) === */}
      <FadeInSection className="fade-delay-5">
        <section className="about-partners">
          <h2>Our Partners</h2>
          <div className="partners-logos" aria-hidden={false}>
            {["Partner 1", "Partner 2", "Partner 3"].map((p, i) => (
              <motion.div
                key={`${p}-${i}`}
                className="partner-logo"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.18 }}
                role="img"
                aria-label={`Partner ${p}`}
              >
                {p}
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* === MEDIA & GALLERY (light neutral) === */}
      <FadeInSection className="fade-delay-6">
        <section className="about-gallery">
          <h2>Gallery Showcase</h2>

          {/* Media cards (if any) */}
          {!mLoad && (
            <div style={{ marginBottom: "1.5rem" }}>
              <MediaCards endpointKey="about" resourceType="media" />
            </div>
          )}

          {/* Photo / Video gallery */}
          <MediaGallery items={galleryItems} />
        </section>
      </FadeInSection>

      {/* === REVIEWS / TESTIMONIALS (neutral card) === */}
      <FadeInSection className="fade-delay-7">
        <section className="reviews-layout">
          <ReviewsLayout
            title="What Our Clients Say"
            description="Here’s what people think about our services"
          >
            <Reviews limit={6} hideForm />
          </ReviewsLayout>
        </section>
      </FadeInSection>
    </div>
  );
};

export default About;
