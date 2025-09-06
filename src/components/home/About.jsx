// src/components/home/About.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import BannerCards from "../context/BannerCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import VideoGallery from "../videos/VideoGallery";

// --- Import direct service modules ---
import VideoService from "../../api/videosAPI";
import ServiceService from "../../api/services";
import ReviewService from "../../api/reviewsAPI"; // if you have a separate service

import "./About.css";

// --- Fallback media ---
const FALLBACKS = {
  video: "/mock/hero-video.mp4",
  image: "/mock/hero-fallback.jpg",
};

// --- Helpers ---
const asArray = (res) => {
  if (!res) return [];
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const safeFetch = async (fn, label = "") => {
  try {
    const res = await fn();
    console.log(`[Success] ${label}:`, res);
    return asArray(res);
  } catch (err) {
    console.error(`[Error] ${label}:`, err);
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
    ""
  );
};

const About = () => {
  const navigate = useNavigate();

  const [bannerMedia, setBannerMedia] = useState([]);
  const [heroVideo, setHeroVideo] = useState(FALLBACKS.video);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // --- Fetch all content ---
  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      // ✅ Fetch videos directly from VideoService
      const banners = await safeFetch(
        () => VideoService.getVideosByEndpoint("about", { is_active: true }),
        "Videos (About)"
      );

      // ✅ Fetch services directly from ServiceService
      const srv = await safeFetch(
        () => ServiceService.getAll(), // adjust if your method is called differently
        "Services"
      );

      // ✅ Fetch reviews from ReviewService or apiService.getReviews
      const reviewsRaw = await safeFetch(
        () => ReviewService.getAll(), // or apiService.getReviews()
        "Reviews"
      );

      if (!active) return;

      const normReviews = reviewsRaw.map((r) => ({
        id: r.id ?? r._id,
        text: r.comment ?? r.message ?? r.content ?? "",
        author: r.name ?? r.reviewer_name ?? "Anonymous",
      }));

      setBannerMedia(banners);
      setServices(srv);
      setTestimonials(normReviews);

      if (!srv.length) toast.warn("No services available currently.");
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, []);

  // --- Hero video selection ---
  useEffect(() => {
    if (bannerMedia.length) {
      const featured = bannerMedia.find(
        (v) => v?.is_featured && getMediaUrl(v).endsWith(".mp4")
      );
      const anyVideo = bannerMedia.find((v) => getMediaUrl(v).endsWith(".mp4"));
      setHeroVideo(getMediaUrl(featured || anyVideo) || FALLBACKS.video);
    } else {
      setHeroVideo(FALLBACKS.video);
    }
  }, [bannerMedia]);

  const heroBannerImage = bannerMedia[0]
    ? getMediaUrl(bannerMedia[0])
    : FALLBACKS.image;

  const galleryItems = bannerMedia.length
    ? bannerMedia.map((m) => ({ url: getMediaUrl(m) }))
    : [{ url: FALLBACKS.image }];

  return (
    <div className="about-container">
      {/* Sticky CTA */}
      <motion.div
        className="sticky-cta-bar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Link to="/bookings" className="sticky-cta-link">
          Let’s Talk
        </Link>
      </motion.div>

      {/* Hero Section */}
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

      {/* Intro Section */}
      <section className="intro text-center">
        <h2 className="section-heading">Who We Are</h2>
        <p className="subtext">
          We don’t just offer services — we deliver lasting impressions.
        </p>
      </section>

      {/* Visual Stories / Featured Media */}
      <BannerCards endpoint="about" title="Explore Our Visual Stories" />

      {/* Services */}
      {services.length > 0 && (
        <section className="service-grid">
          <h2 className="section-heading">What We Do</h2>
          <div className="service-grid-inner">
            {services.map(({ id, icon_url, title, name, description }) => (
              <article key={id} className="service-card" tabIndex={0}>
                {icon_url && (
                  <img
                    src={icon_url}
                    alt={title || name}
                    className="service-icon-img"
                  />
                )}
                <h3 className="service-title">{title || name}</h3>
                {description && <p className="service-desc">{description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Showcase */}
      <section className="gallery-showcase">
        <h2 className="section-heading">Gallery</h2>
        <GalleryWrapper items={galleryItems} />
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
