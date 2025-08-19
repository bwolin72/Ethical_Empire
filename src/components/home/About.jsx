import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaCheckCircle, FaClock, FaCogs, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

import useMediaFetcher from "../../hooks/useMediaFetcher";
import MediaCards from "../context/MediaCards";
import MediaCard from "../context/MediaCard";
import BannerCards from "../context/BannerCards";
import apiService from "../../api/apiService";

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

const About = () => {
  /* ✅ Banners for hero fallback (uses your useMediaFetcher endpointKey = 'about') */
  const aboutFetch = useMediaFetcher("about");
  const bannerList =
    (Array.isArray(aboutFetch?.media) && aboutFetch.media) ||
    (Array.isArray(aboutFetch?.data) && aboutFetch.data) ||
    [];

  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [videoHeroUrl, setVideoHeroUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllServices = async () => {
      try {
        const res = await apiService.getServices(); // GET /api/services/
        const serviceList = Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res?.data)
          ? res.data
          : [];
        if (isMounted) setServices(serviceList);
        if (!serviceList?.length) toast.warn("No services available at the moment.");
      } catch (error) {
        console.error("Services fetch error:", error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await apiService.getReviews(); // GET /api/reviews/
        const list = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) setTestimonials(list);
      } catch (error) {
        console.error("Testimonials fetch error:", error);
      }
    };

    const fetchVideoHero = async () => {
      try {
        // ✅ Match API: use dedicated “about” videos endpoint
        const res = await apiService.getAboutVideos(); // GET /api/videos/about/
        const list = Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res?.data)
          ? res.data
          : [];
        const featured = list.find((v) => v?.is_featured) || list[0];
        const url = getMediaUrl(featured);
        if (isMounted && url?.toLowerCase().endsWith(".mp4")) {
          setVideoHeroUrl(url);
        }
      } catch (error) {
        console.error("Hero video fetch error:", error);
      }
    };

    fetchAllServices();
    fetchTestimonials();
    fetchVideoHero();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="about-container">
      {/* Sticky CTA */}
      <div className="sticky-cta-bar">
        <Link to="/bookings" className="sticky-cta-link">Let’s Talk</Link>
      </div>

      {/* === Hero Video or Banner === */}
      <section className="about-hero">
        {videoHeroUrl ? (
          <div className="hero-banner video">
            <video
              src={videoHeroUrl}
              autoPlay
              loop
              muted
              playsInline
              className="hero-video"
            />
            <div className="hero-overlay"></div>
            <div className="hero-copy">
              <h1 className="hero-title">Ethical Multimedia GH</h1>
              <p className="hero-subtitle">
                Crafting unforgettable experiences across music, visuals, and events.
              </p>
              <div className="hero-actions">
                <Link to="/bookings" className="btn btn-primary">Book a Service</Link>
                <a href="#why-us" className="btn btn-ghost">Why Choose Us</a>
              </div>
            </div>
          </div>
        ) : bannerList.length > 0 ? (
          <div className="hero-banner mb-10">
            <MediaCard media={bannerList[0]} fullWidth />
          </div>
        ) : (
          <div className="hero-fallback">
            <h1 className="hero-title">Ethical Multimedia GH</h1>
            <p className="hero-subtitle">Creative production, seamless execution.</p>
          </div>
        )}
      </section>

      {/* Intro */}
      <section className="intro text-center">
        <h2 className="section-heading">Who We Are</h2>
        <p className="subtext">
          We don’t just offer services — we deliver lasting impressions.
        </p>
      </section>

      {/* Visual Stories */}
      <BannerCards endpoint="about" title="Explore Our Visual Stories" />

      {/* === Services Grid === */}
      {services.length > 0 && (
        <section className="service-grid" aria-labelledby="services-heading">
          <h2 id="services-heading" className="section-heading">What We Do</h2>
          <div className="service-grid-inner">
            {services.map(({ id, icon_url, title, name, description }) => (
              <article key={id} className="service-card">
                {icon_url && (
                  <img src={icon_url} alt={title || name} className="service-icon-img" />
                )}
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

      {/* Featured Media */}
      <MediaCards
        endpoint="about"
        type="media"
        title="Our Work in Action"
        fullWidth
        isFeatured={true}
      />

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
              <li key={idx}><FaCheck aria-hidden="true" /> {item}</li>
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

      {/* Testimonials (align to backend fields: name/comment) */}
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
        <Link to="/bookings" className="cta-button">Book a Service</Link>
      </section>
    </div>
  );
};

export default About;
