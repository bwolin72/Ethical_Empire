// src/components/home/About.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaCheckCircle, FaClock, FaCogs, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

import useMediaFetcher from "../../hooks/useFetcher";
import MediaCards from "../context/MediaCards";
import MediaCard from "../context/MediaCard";
import BannerCards from "../context/BannerCards";
import apiService from "../../api/apiService";
import videoService from "../../api/services/videoService"; // ✅ video API

import euniceImg from "../../assets/team/eunice.png";
import josephImg from "../../assets/team/joseph.jpg";

import "./About.css";

/* ------------ helpers ------------ */
const getMediaUrl = (media) => {
  if (!media) return "";
  const val =
    (media?.url && (media.url.full ?? media.url)) ??
    media?.file_url ??
    media?.file ??
    media?.video_url ??
    media?.video_file ??
    "";
  return typeof val === "string" ? val : String(val ?? "");
};

/* ------------ local fallbacks ------------ */
const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const About = () => {
  // fetch banners/images for About page
  const aboutFetch = useMediaFetcher("about");
  const mediaItems =
    (Array.isArray(aboutFetch?.media) && aboutFetch.media) ||
    (Array.isArray(aboutFetch?.data) && aboutFetch.data) ||
    [];

  // hero video state
  const [heroVideoUrl, setHeroVideoUrl] = useState(null);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);

  // backend lists
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const bannerList = Array.isArray(mediaItems) ? mediaItems : [];

  /* ---------- fetch About videos for hero ---------- */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await videoService.about();
        const list = Array.isArray(res?.data) ? res.data : [];

        const featured = list.find(
          (v) => v?.is_featured && getMediaUrl(v).toLowerCase().endsWith(".mp4")
        );
        const anyVideo = list.find((v) =>
          getMediaUrl(v).toLowerCase().endsWith(".mp4")
        );

        if (featured) setHeroVideoUrl(getMediaUrl(featured));
        else if (anyVideo) setHeroVideoUrl(getMediaUrl(anyVideo));
        else setHeroVideoUrl(LOCAL_FALLBACK_VIDEO);

        setVideoLoadFailed(false);
      } catch (err) {
        console.error("About videos fetch error:", err);
        setHeroVideoUrl(LOCAL_FALLBACK_VIDEO);
      }
    };

    fetchVideos();
  }, []);

  /* ---------- fetch services & testimonials ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchServices = async () => {
      try {
        const res = await apiService.getServices?.();
        const serviceList = Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res?.data)
          ? res.data
          : [];
        if (mounted) {
          setServices(serviceList);
          if (!serviceList.length) toast.warn("No services available at the moment.");
        }
      } catch (err) {
        console.error("Services fetch error:", err);
        if (mounted) toast.error("Failed to load services.");
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await apiService.getReviews?.();
        const reviewList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.results)
          ? res.data.results
          : [];
        if (mounted) setTestimonials(reviewList);
      } catch (err) {
        console.error("Reviews fetch error:", err);
      }
    };

    fetchServices();
    fetchReviews();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- handlers ---------- */
  const onHeroVideoError = () => {
    setVideoLoadFailed(true);
    if (heroVideoUrl !== LOCAL_FALLBACK_VIDEO) {
      setHeroVideoUrl(LOCAL_FALLBACK_VIDEO);
    }
  };

  /* ---------- hero display ---------- */
  const effectiveHeroVideo = videoLoadFailed ? LOCAL_FALLBACK_VIDEO : heroVideoUrl;
  const heroBanner = bannerList.length > 0 ? bannerList[0] : null;
  const heroBannerImage = getMediaUrl(heroBanner) || null;
  const heroHasVideo =
    typeof effectiveHeroVideo === "string" &&
    effectiveHeroVideo.toLowerCase().endsWith(".mp4");

  return (
    <div className="about-container">
      {/* Sticky CTA */}
      <div className="sticky-cta-bar">
        <Link to="/bookings" className="sticky-cta-link">
          Let’s Talk
        </Link>
      </div>

      {/* === Hero Section === */}
      <section className="about-hero">
        {heroHasVideo ? (
          <div className="hero-banner video">
            <video
              src={effectiveHeroVideo}
              autoPlay
              loop
              muted
              playsInline
              poster={heroBannerImage || LOCAL_FALLBACK_IMAGE}
              className="hero-video"
              onError={onHeroVideoError}
            />
            <div className="hero-overlay" />
            <div className="hero-copy">
              <h1 className="hero-title">Ethical Multimedia GH</h1>
              <p className="hero-subtitle">
                Crafting unforgettable experiences across music, visuals, and events.
              </p>
              <div className="hero-actions">
                <Link to="/bookings" className="btn btn-primary">
                  Book a Service
                </Link>
                <a href="#why-us" className="btn btn-ghost">
                  Why Choose Us
                </a>
              </div>
            </div>
          </div>
        ) : heroBannerImage ? (
          <div className="hero-banner mb-10">
            <MediaCard media={heroBanner} fullWidth />
          </div>
        ) : (
          <div className="hero-banner fallback">
            <img src={LOCAL_FALLBACK_IMAGE} alt="Fallback hero" className="hero-fallback-img" />
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

      {/* Visual Stories (banner cards) */}
      <BannerCards endpoint="about" title="Explore Our Visual Stories" />

      {/* === Services Grid === */}
      {services.length > 0 && (
        <section className="service-grid" aria-labelledby="services-heading">
          <h2 id="services-heading" className="section-heading">
            What We Do
          </h2>
          <div className="service-grid-inner">
            {services.map(({ id, icon_url, title, name, description }) => (
              <article key={id} className="service-card" tabIndex={0}>
                {icon_url && <img src={icon_url} alt={title || name} className="service-icon-img" />}
                <h3 className="service-title">{title || name}</h3>
                {description && <p className="service-desc">{description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Values */}
      <section className="values">
        <div className="values-grid">
          <div className="value-card">
            <FaCheckCircle className="value-icon" />
            <h3>Integrity</h3>
            <p>Transparent communication and delivery you can trust.</p>
          </div>
          <div className="value-card">
            <FaCogs className="value-icon" />
            <h3>Craft</h3>
            <p>Refined visuals, audio, and staging from seasoned pros.</p>
          </div>
          <div className="value-card">
            <FaClock className="value-icon" />
            <h3>Reliability</h3>
            <p>On time, on budget, and beyond expectations.</p>
          </div>
        </div>
      </section>

      {/* About copy */}
      <section className="about-text">
        <h2 className="section-heading">Our Story</h2>
        <p>
          At <strong>Ethical Multimedia GH</strong>, we merge artistic passion with event precision.
          From live performances and stunning visuals to disciplined coordination, we turn ideas
          into memorable experiences for weddings, concerts, and corporate events.
        </p>
      </section>

      {/* Featured Media Carousel */}
      <section className="featured-media-section">
        <h2 className="section-heading">Our Work in Action</h2>
        <div className="featured-carousel">
          <MediaCards endpoint="about" type="media" isFeatured={true} fullWidth />
        </div>
      </section>

      {/* Commitments */}
      <section className="about-text">
        <h2 className="section-heading">Our Commitment</h2>
        <p>
          We value integrity, artistry, and a deep understanding of your goals. Every event is
          approached with care, strategy, and passion — ensuring it's not just successful, but unforgettable.
        </p>
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
            ].map((item, idx) => (
              <li key={idx}>
                <FaCheck aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="why-star">
          <FaStar className="star-icon" />
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <h2 className="section-heading">Meet the Team</h2>
        <p className="team-sub">The people behind the performances and precision.</p>
        <div className="team-grid">
          <div className="team-member">
            <img src={euniceImg} alt="Mrs. Eunice Chai" className="team-img" />
            <h4>Mrs. Eunice Chai</h4>
            <p>Operations Manager</p>
          </div>
          <div className="team-member">
            <img src={josephImg} alt="Mr. Nhyira Nana Joseph" className="team-img" />
            <h4>Mr. Nhyira Nana Joseph</h4>
            <p>Event Manager</p>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="press-logos">
        <h2 className="section-heading text-center">Trusted By</h2>
        <div className="logo-carousel" aria-label="Partner logos">
          <img src="/logos/client1.png" alt="Client 1" />
          <img src="/logos/client2.png" alt="Client 2" />
          <img src="/logos/client3.png" alt="Client 3" />
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="testimonial-carousel">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="carousel-wrapper">
            {testimonials.map((review, idx) => (
              <div key={review?.id ?? idx} className="testimonial-slide">
                {review?.comment && <p>“{review.comment}”</p>}
                <p className="testimonial-author">— {review?.name || "Anonymous"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <h3 className="cta-title">Let’s create something remarkable together.</h3>
        <Link to="/bookings" className="cta-button">
          Book a Service
        </Link>
      </section>
    </div>
  );
};

export default About;
