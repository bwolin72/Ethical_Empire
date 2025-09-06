// src/components/home/About.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaCheckCircle, FaClock, FaCogs, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import useFetcher from "../../hooks/useFetcher";
import MediaCards from "../context/MediaCards";
import MediaCard from "../context/MediaCard";
import BannerCards from "../context/BannerCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import apiService from "../../api/apiService";
import VideoGallery from "../videos/VideoGallery";

import euniceImg from "../../assets/team/eunice.png";
import josephImg from "../../assets/team/joseph.jpg";

import "./About.css";

/* ------------ Helpers ------------ */
const getMediaUrl = (media) => {
  if (!media) return "";
  return media?.url?.full ?? media?.url ?? media?.file_url ?? media?.file ?? media?.video_url ?? media?.video_file ?? "";
};

const FALLBACKS = {
  video: "/mock/hero-video.mp4",
  image: "/mock/hero-fallback.jpg",
};

const About = () => {
  /* ------------ Fetch Media & Videos ------------ */
  const { data: aboutMedia } = useFetcher("videos", "about"); // fetch videos with fallback support
  const bannerList = Array.isArray(aboutMedia) ? aboutMedia : [];

  const [heroVideo, setHeroVideo] = useState(FALLBACKS.video);
  const [videoFailed, setVideoFailed] = useState(false);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  /* ---------- Hero Video Logic ---------- */
  useEffect(() => {
    const pickFeatured = bannerList.find(v => v?.is_featured && getMediaUrl(v).endsWith(".mp4"));
    const pickAnyVideo = bannerList.find(v => getMediaUrl(v).endsWith(".mp4"));
    setHeroVideo(getMediaUrl(pickFeatured || pickAnyVideo) || FALLBACKS.video);
    setVideoFailed(false);
  }, [bannerList]);

  const handleVideoError = () => {
    setVideoFailed(true);
    setHeroVideo(FALLBACKS.video);
  };

  /* ---------- Fetch Services & Testimonials ---------- */
  useEffect(() => {
    let active = true;

    const fetchServices = async () => {
      try {
        const res = await apiService.getServices?.();
        const list = res?.data?.results || res?.data || [];
        if (active) {
          setServices(Array.isArray(list) ? list : []);
          if (!list?.length) toast.warn("No services available currently.");
        }
      } catch {
        if (active) toast.error("Failed to load services.");
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await apiService.getReviews?.();
        const list = res?.data?.results || res?.data || [];
        if (active) setTestimonials(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      }
    };

    fetchServices();
    fetchTestimonials();

    return () => { active = false; };
  }, []);

  const heroBannerImage = bannerList[0] ? getMediaUrl(bannerList[0]) : null;
  const effectiveVideo = !videoFailed && heroVideo?.endsWith(".mp4") ? heroVideo : null;

  return (
    <div className="about-container">
      {/* Sticky CTA */}
      <motion.div className="sticky-cta-bar" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Link to="/bookings" className="sticky-cta-link">Let’s Talk</Link>
      </motion.div>

      {/* Hero Section */}
      <section className="about-hero">
        {effectiveVideo ? (
          <div className="hero-banner video">
            <video
              src={effectiveVideo}
              autoPlay
              loop
              muted
              playsInline
              poster={heroBannerImage || FALLBACKS.image}
              className="hero-video"
              onError={handleVideoError}
            />
            <div className="hero-overlay" />
            <motion.div className="hero-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="hero-title">Ethical Multimedia GH</h1>
              <p className="hero-subtitle">Crafting unforgettable experiences across music, visuals, and events.</p>
              <div className="hero-actions">
                <Link to="/bookings" className="btn btn-primary">Book a Service</Link>
                <a href="#why-us" className="btn btn-ghost">Why Choose Us</a>
              </div>
            </motion.div>
          </div>
        ) : heroBannerImage ? (
          <MediaCard media={bannerList[0]} fullWidth />
        ) : (
          <div className="hero-banner fallback">
            <img src={FALLBACKS.image} alt="Hero fallback" className="hero-fallback-img" />
            <div className="hero-copy">
              <h1 className="hero-title">Ethical Multimedia GH</h1>
              <p className="hero-subtitle">Creative production, seamless execution.</p>
            </div>
          </div>
        )}
      </section>

      {/* Intro */}
      <section className="intro text-center">
        <h2 className="section-heading">Who We Are</h2>
        <p className="subtext">We don’t just offer services — we deliver lasting impressions.</p>
      </section>

      {/* Visual Stories */}
      <BannerCards endpoint="about" title="Explore Our Visual Stories" />

      {/* Services */}
      {services.length > 0 && (
        <section className="service-grid">
          <h2 className="section-heading">What We Do</h2>
          <div className="service-grid-inner">
            {services.map(({ id, icon_url, title, name, description }) => (
              <motion.article key={id} className="service-card" whileHover={{ scale: 1.03 }} tabIndex={0}>
                {icon_url && <img src={icon_url} alt={title || name} className="service-icon-img" />}
                <h3>{title || name}</h3>
                {description && <p>{description}</p>}
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* Values */}
      <section className="values">
        <div className="values-grid">
          {[
            { icon: <FaCheckCircle />, title: "Integrity", text: "Transparent communication and delivery you can trust." },
            { icon: <FaCogs />, title: "Craft", text: "Refined visuals, audio, and staging from seasoned pros." },
            { icon: <FaClock />, title: "Reliability", text: "On time, on budget, and beyond expectations." },
          ].map((v, idx) => (
            <motion.div key={idx} className="value-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="about-text">
        <h2 className="section-heading">Our Story</h2>
        <p>At <strong>Ethical Multimedia GH</strong>, we merge artistic passion with event precision. From live performances and stunning visuals to disciplined coordination, we turn ideas into memorable experiences.</p>
      </section>

      {/* Video Gallery */}
      <VideoGallery endpoint="about" title="Our Work in Motion" />

      {/* Featured Media */}
      <section className="featured-media-section">
        <h2 className="section-heading">Our Work in Action</h2>
        <MediaCards endpoint="about" type="media" isFeatured fullWidth />
      </section>

      {/* Commitment */}
      <section className="about-text">
        <h2 className="section-heading">Our Commitment</h2>
        <p>We value integrity, artistry, and a deep understanding of your goals. Every event is approached with care, strategy, and passion — ensuring it’s not just successful, but unforgettable.</p>
      </section>

      {/* Why Us */}
      <section id="why-us" className="why-section">
        <div className="why-copy">
          <h3 className="why-heading">Why Clients Trust Us</h3>
          <ul className="why-list">
            {[
              "Over a decade of multimedia and event expertise.",
              "A versatile team of creatives, planners, and performers.",
              "Cutting-edge equipment and visual production.",
              "Flexible packages and transparent pricing.",
              "A track record of flawless delivery across Ghana and beyond.",
            ].map((item, i) => <li key={i}><FaCheck /> {item}</li>)}
          </ul>
        </div>
        <div className="why-star"><FaStar className="star-icon" /></div>
      </section>

      {/* Team */}
      <section className="team-section">
        <h2 className="section-heading">Meet the Team</h2>
        <p className="team-sub">The people behind the performances and precision.</p>
        <div className="team-grid">
          {[ 
            { img: euniceImg, name: "Mrs. Eunice Chai", role: "Operations Manager" },
            { img: josephImg, name: "Mr. Nhyira Nana Joseph", role: "Event Manager" }
          ].map((m, idx) => (
            <div className="team-member" key={idx}>
              <img src={m.img} alt={m.name} className="team-img" />
              <h4>{m.name}</h4>
              <p>{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trusted Logos */}
      <section className="press-logos">
        <h2 className="section-heading text-center">Trusted By</h2>
        <div className="logo-carousel">
          <img src="/logos/client1.png" alt="Client 1" />
          <img src="/logos/client2.png" alt="Client 2" />
          <img src="/logos/client3.png" alt="Client 3" />
        </div>
      </section>

      {/* Gallery */}
      <GalleryWrapper endpoint="about" limit={8} title="Highlights in Motion" />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="testimonial-carousel">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="carousel-wrapper">
            {testimonials.map((r, idx) => (
              <motion.div key={r?.id ?? idx} className="testimonial-slide" whileHover={{ scale: 1.02 }}>
                {r?.comment && <p>“{r.comment}”</p>}
                <p className="testimonial-author">— {r?.name || "Anonymous"}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <motion.section className="cta-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <h3 className="cta-title">Let’s create something remarkable together.</h3>
        <Link to="/bookings" className="cta-button">Book a Service</Link>
      </motion.section>
    </div>
  );
};

export default About;
