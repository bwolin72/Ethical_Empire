import React from "react";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import VideoGallery from "../videos/VideoGallery";
import Services from "./Services";

import useFetcher from "../../hooks/useFetcher";

import josephImg from "../../assets/team/joseph.jpg";
import euniceImg from "../../assets/team/eunice.png";

import "./About.css";

const LOCAL_FALLBACK_VIDEO = "/mock/hero-video.mp4";
const LOCAL_FALLBACK_IMAGE = "/mock/hero-fallback.jpg";

const About = () => {
  const navigate = useNavigate();

  // ===== API DATA =====
  const { data: videos = [], loading: videosLoading, error: videosError } =
    useFetcher("videos", "about");

  const { data: media = [], loading: mediaLoading, error: mediaError } =
    useFetcher("media", "about");

  const { data: banners = [], loading: bannerLoading, error: bannerError } =
    useFetcher("promotions", "about"); // or "banners" if you have dedicated endpoint

  // ===== HERO VIDEO =====
  const heroVideo =
    videos.length > 0
      ? videos[0]
      : { url: { full: LOCAL_FALLBACK_VIDEO }, file_type: "video/mp4" };

  // ===== MERGE GALLERY =====
  const galleryItems = [...videos, ...media]
    .filter(Boolean)
    .map((item) => (item?.url ? item : null))
    .filter(Boolean);

  if (galleryItems.length === 0) {
    galleryItems.push({
      url: { full: LOCAL_FALLBACK_IMAGE },
      file_type: "image/jpeg",
    });
  }

  return (
    <div className="about-page">
      {/* ===== HERO VIDEO ===== */}
      <section className="about-hero-section">
        <VideoGallery
          videos={[heroVideo]}
          fallbackVideo={LOCAL_FALLBACK_VIDEO}
          showHero
          autoPlay
          loop
          allowMuteToggle
          title="About Eethm Multimedia GH"
          subtitle="Excellence in Live Band • Catering • Multimedia • Decor"
          actions={[
            {
              label: "Book Now",
              onClick: () => navigate("/bookings"),
              className: "btn-primary",
            },
          ]}
        />
      </section>

      {/* ===== ABOUT CONTENT ===== */}
      <FadeInSection>
        <section className="about-info-section">
          <h2>Who We Are</h2>
          <p>
            At <strong>Eethm Multimedia GH</strong>, we are passionate about
            creating unforgettable experiences. From live band ministrations to
            world-class catering, multimedia, and décor services, we bring
            creativity, professionalism, and excellence to every event.
          </p>
          <p>
            Our mission is to inspire joy, foster connections, and celebrate
            life’s most meaningful moments with authenticity and style.
          </p>
        </section>
      </FadeInSection>

      {/* ===== BANNERS ===== */}
      <FadeInSection>
        <section className="about-banners-section">
          <h2>Our Highlights</h2>
          {bannerLoading && <p>Loading banners…</p>}
          {bannerError && <p className="error-text">{bannerError}</p>}
          <BannerCards endpointKey="about" type="banner" />
        </section>
      </FadeInSection>

      {/* ===== SERVICES ===== */}
      <FadeInSection>
        <section className="about-services-section">
          <h2>What We Do</h2>
          <Services />
        </section>
      </FadeInSection>

      {/* ===== TEAM ===== */}
      <FadeInSection>
        <section className="about-team-section">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <img src={josephImg} alt="Joseph" />
              <h3>Joseph</h3>
              <p>Event Manager</p>
            </div>
            <div className="team-card">
              <img src={euniceImg} alt="Eunice" />
              <h3>Eunice</h3>
              <p>Creative Director</p>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ===== PARTNERS ===== */}
      <FadeInSection>
        <section className="about-partners-section">
          <h2>Our Partners</h2>
          <div className="partners-logos">
            {/* Replace with actual partner logos */}
            <div className="partner-logo">Partner 1</div>
            <div className="partner-logo">Partner 2</div>
            <div className="partner-logo">Partner 3</div>
          </div>
        </section>
      </FadeInSection>

      {/* ===== MEDIA ===== */}
      <FadeInSection>
        <section className="about-media-section">
          <h2>Media Library</h2>
          {mediaLoading && <p>Loading media…</p>}
          {mediaError && <p className="error-text">{mediaError}</p>}
          <MediaCards
            endpointKey="about"
            resourceType="media"
            fullWidth={false}
            isActive
            isFeatured={false}
          />
        </section>
      </FadeInSection>

      {/* ===== GALLERY ===== */}
      <FadeInSection>
        <section className="about-gallery-section">
          <h2>Gallery Showcase</h2>
          {videosError && <p className="error-text">{videosError}</p>}
          <MediaGallery items={galleryItems} />
        </section>
      </FadeInSection>
    </div>
  );
};

export default About;
