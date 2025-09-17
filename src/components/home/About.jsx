import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import BannerCards from "../context/BannerCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import MediaGallery from "../gallery/MediaGallery";

import EuniceImg from "../../assets/team/eunice.png";
import JosephImg from "../../assets/team/joseph.jpg";

import "./About.css";

const FALLBACKS = {
  video: "/mock/hero-video.mp4",
  image: "/mock/hero-fallback.jpg",
};

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
        {/* The Video/hero section can simply be a MediaGallery 
            which pulls videos from your API via useFetcher */}
        <MediaGallery
          endpoint="about/hero-media"
          fallbackVideo={FALLBACKS.video}
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
        endpoint="about/banners"
        title="Explore Our Visual Stories"
      />

      {/* ── Services (fetched internally by MediaCards) ────── */}
      <section className="service-grid" id="why-us">
        <h2 className="section-heading">What We Do</h2>
        {/* MediaCards will fetch and render service items from the endpoint */}
        <div className="service-grid-inner">
          <MediaGallery endpoint="services" cardComponent="MediaCard" />
        </div>
      </section>

      {/* ── Gallery Showcase ──────────────────────── */}
      <section className="gallery-showcase">
        <h2 className="section-heading">Gallery</h2>
        {/* GalleryWrapper handles its own fetching/display */}
        <GalleryWrapper endpoint="gallery" />
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
        <MediaGallery endpoint="reviews" type="carousel" />
      </section>
    </div>
  );
}
