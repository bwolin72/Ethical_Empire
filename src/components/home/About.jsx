import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import BannerCards from "../context/BannerCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import VideoGallery from "../videos/VideoGallery";

import useFetcher from "../../hooks/useFetcher";
import { API_ENDPOINTS } from "../../api/apiService";

import EuniceImg from "../../assets/team/eunice.png";
import JosephImg from "../../assets/team/joseph.jpg";

import "./About.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const TEAM = [
  {
    id: "team-eunice",
    name: "Eunice",
    role: "Operations & Client Relations",
    image: EuniceImg,
    bio: "Ensures smooth coordination and a top-notch client experience.",
  },
  {
    id: "team-joseph",
    name: "Joseph",
    role: "Creative Lead",
    image: JosephImg,
    bio: "Creative direction across music, visuals and live events.",
  },
];

export default function About() {
  const navigate = useNavigate();

  // ✅ Hero video (media.about endpoint)
  const { data: heroVideos = [] } = useFetcher(API_ENDPOINTS.media.about);
  const heroVideo = heroVideos.length
    ? heroVideos[0]
    : { url: LOCAL_FALLBACK_VIDEO };

  // ✅ Reviews
  const { data: reviews = [], error: reviewError } = useFetcher(
    API_ENDPOINTS.reviews.all
  );

  return (
    <div className="about-container">
      {/* ── Sticky CTA ────────────────────────────── */}
      <motion.div
        className="sticky-cta-bar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to="/bookings" className="sticky-cta-link">
          Let’s Talk
        </Link>
      </motion.div>

      {/* ── Hero Banner / Video ───────────────────── */}
      <section className="about-hero">
        <VideoGallery
          videos={[heroVideo]}
          fallbackVideo={LOCAL_FALLBACK_VIDEO}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Ethical Multimedia GH"
          subtitle="Crafting unforgettable experiences across music, visuals, and events."
          actions={[
            {
              label: "Book a Service",
              onClick: () => navigate("/bookings"),
              className: "btn-primary",
            },
            {
              label: "Why Choose Us",
              onClick: () =>
                document.getElementById("why-us")?.scrollIntoView(),
              className: "btn-ghost",
            },
          ]}
        />
      </section>

      {/* ── Intro Text ────────────────────────────── */}
      <section className="intro text-center">
        <h2 className="section-heading">Who We Are</h2>
        <p className="subtext">
          We don’t just offer services — we deliver lasting impressions.
        </p>
      </section>

      {/* ── Visual Stories / Banners ──────────────── */}
      <BannerCards
        endpointKey={API_ENDPOINTS.media.banners}   // ✅ fixed
        title="Explore Our Visual Stories"
      />

      {/* ── Services Grid ────── */}
      <section className="service-grid" id="why-us">
        <h2 className="section-heading">What We Do</h2>
        <div className="service-grid-inner">
          <MediaCards
            endpointKey={API_ENDPOINTS.services.all}   // ✅ fixed
            resourceType="services"
          />
        </div>
      </section>

      {/* ── Gallery Showcase ──────────────────────── */}
      <section className="gallery-showcase">
        <h2 className="section-heading">Gallery</h2>
        <GalleryWrapper endpointKey={API_ENDPOINTS.media.home} /> {/* ✅ fixed */}
      </section>

      {/* ── Team Section ──────────────────────────── */}
      <section className="team-section">
        <h2 className="section-heading">Meet Our Team</h2>
        <div className="team-grid">
          {TEAM.map((member) => (
            <article key={member.id} className="team-member">
              <div className="team-photo-wrap">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-photo"
                />
              </div>
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <p className="team-bio">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Testimonials Carousel ─────────────────── */}
      <section className="testimonial-carousel">
        <h2 className="section-heading">What Our Clients Say</h2>
        {reviewError && <p className="error-text">{reviewError}</p>}
        <MediaGallery items={reviews.length ? reviews : []} type="carousel" />
      </section>
    </div>
  );
}
