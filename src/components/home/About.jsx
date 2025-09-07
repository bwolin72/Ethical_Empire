// src/components/home/About.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import BannerCards from "../context/BannerCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import VideoGallery from "../videos/VideoGallery";

import contentService from "../../api/services/contentService";
import serviceService from "../../api/services/serviceService";

import "./About.css";

// team assets
import EuniceImg from "../../assets/team/eunice.png";
import JosephImg from "../../assets/team/joseph.jpg";

// --- Fallback media ---
const FALLBACKS = {
  video: "/mock/hero-video.mp4",
  image: "/mock/hero-fallback.jpg",
};

// --- Helpers ---
const toArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.results)) return res.data.results;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.items)) return res.items;
  return [];
};

const safeFetch = async (fn, label = "") => {
  try {
    const res = await fn();
    const arr = toArray(res);
    console.debug(`[safeFetch][${label}] result length: ${arr.length}`, res);
    return arr;
  } catch (err) {
    console.error(`[safeFetch][${label}] error:`, err);
    return [];
  }
};

const getMediaUrl = (media) => {
  if (!media) return "";
  return (
    media?.url?.full ??
    media?.url ??
    media?.file_url ??
    media?.file ??
    media?.video_url ??
    media?.video_file ??
    media?.image_url ??
    ""
  );
};

const About = () => {
  const navigate = useNavigate();
  const [bannerMedia, setBannerMedia] = useState([]);
  const [heroVideo, setHeroVideo] = useState(FALLBACKS.video);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      // Videos for about page
      const banners = await safeFetch(
        () => contentService.getVideos({ endpoint: "about", is_active: true }),
        "Videos (About)"
      );

      // Services — call serviceService directly
      const srv = await safeFetch(() => serviceService.getServices(), "Services");

      // Reviews
      const reviewsRaw = await safeFetch(() => contentService.getReviews(), "Reviews");

      if (!active) return;

      const normReviews = reviewsRaw.map((r) => ({
        id: r?.id ?? r?._id ?? null,
        text: r?.comment ?? r?.message ?? r?.content ?? r?.text ?? "",
        author: r?.name ?? r?.reviewer_name ?? r?.author ?? "Anonymous",
      }));

      setBannerMedia(banners);
      setServices(srv);
      setTestimonials(normReviews);

      if (!srv || srv.length === 0) toast.warn("No services available currently.");
    };

    fetchAll();
    return () => { active = false; };
  }, []);

  // choose hero video
  useEffect(() => {
    if (bannerMedia && bannerMedia.length) {
      const featured = bannerMedia.find(
        (v) => v?.is_featured && getMediaUrl(v).toLowerCase().endsWith(".mp4")
      );
      const anyVideo = bannerMedia.find((v) =>
        getMediaUrl(v).toLowerCase().endsWith(".mp4")
      );
      const chosen = featured || anyVideo;
      setHeroVideo(getMediaUrl(chosen) || FALLBACKS.video);
    } else {
      setHeroVideo(FALLBACKS.video);
    }
  }, [bannerMedia]);

  const galleryItems = bannerMedia.length
    ? bannerMedia.map((m) => ({ url: getMediaUrl(m) }))
    : [{ url: FALLBACKS.image }];

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

  return (
    <div className="about-container">
      {/* Sticky CTA */}
      <motion.div
        className="sticky-cta-bar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to="/bookings" className="sticky-cta-link">Let’s Talk</Link>
      </motion.div>

      {/* Hero */}
      <section className="about-hero">
        <VideoGallery
          videos={[{ url: heroVideo }]}
          fallbackVideo={FALLBACKS.video}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="Ethical Multimedia GH"
          subtitle="Crafting unforgettable experiences across music, visuals, and events."
          actions={[
            { label: "Book a Service", onClick: () => navigate("/bookings"), className: "btn-primary" },
            { label: "Why Choose Us", onClick: () => document.getElementById("why-us")?.scrollIntoView(), className: "btn-ghost" },
          ]}
        />
      </section>

      {/* Intro */}
      <section className="intro text-center">
        <h2 className="section-heading">Who We Are</h2>
        <p className="subtext">We don’t just offer services — we deliver lasting impressions.</p>
      </section>

      {/* Visual Stories */}
      <BannerCards endpoint="about" title="Explore Our Visual Stories" />

      {/* Services */}
      <section className="service-grid">
        <h2 className="section-heading">What We Do</h2>
        <div className="service-grid-inner">
          {services.length > 0 ? (
            services.map((s) => {
              const id = s?.id ?? s?._id ?? s?.slug ?? Math.random();
              const icon = s?.icon_url || s?.icon || s?.image_url || null;
              const title = s?.title || s?.name || s?.label || "";
              return (
                <article key={id} className="service-card" tabIndex={0}>
                  {icon && <img src={icon} alt={title} className="service-icon-img" />}
                  <h3 className="service-title">{title}</h3>
                  {s?.description && <p className="service-desc">{s.description}</p>}
                </article>
              );
            })
          ) : (
            <p className="muted">Services will be listed here when available.</p>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery-showcase">
        <h2 className="section-heading">Gallery</h2>
        <GalleryWrapper items={galleryItems} />
      </section>

      {/* Team */}
      <section className="team-section">
        <h2 className="section-heading">Meet Our Team</h2>
        <div className="team-grid">
          {TEAM.map((m) => (
            <article key={m.id} className="team-member">
              <div className="team-photo-wrap">
                <img src={m.image} alt={m.name} className="team-photo" />
              </div>
              <h3 className="team-name">{m.name}</h3>
              <p className="team-role">{m.role}</p>
              <p className="team-bio">{m.bio}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="testimonial-carousel">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="carousel-wrapper">
            {testimonials.map((t, idx) => (
              <div key={t.id ?? `review-${idx}`} className="testimonial-slide">
                <p>"{t.text}"</p>
                <p>— {t.author}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
