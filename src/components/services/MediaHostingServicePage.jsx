import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";
import ServiceCategory from "./ServiceCategory";
import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import useFetcher from "../../hooks/useFetcher";

import livebandHero from "../../assets/liveband/liveband-hero.jpg";
import cateringWallpaper from "../../assets/images/catering-wallpaper.png";
import stageDecor from "../../assets/decor/stage-decor.png";

import "./MediaHostingServicePage.css";

/* -------------------------------
   Helpers
-------------------------------- */
const toArray = (payload) => {
  try {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload.filter(Boolean);
    if (Array.isArray(payload.data)) return payload.data.filter(Boolean);
    if (typeof payload === "object") {
      const values = Object.values(payload).flat();
      return Array.isArray(values) ? values.filter(Boolean) : [];
    }
    return [];
  } catch {
    return [];
  }
};

const getMediaUrl = (media) => {
  const candidates = [
    media?.secure_url,
    media?.url?.full,
    media?.url,
    media?.video_url,
    media?.video_file,
    media?.file_url,
    media?.file,
    media?.src,
    media?.path,
  ];
  const found = candidates.find((c) => typeof c === "string" && c.trim() !== "");
  if (!found && media?.public_id && media?.cloud_name) {
    return `https://res.cloudinary.com/${media.cloud_name}/image/upload/${media.public_id}`;
  }
  return found || "";
};

/* -------------------------------
   Main Component
-------------------------------- */
export default function MediaHostingServicePage() {
  const navigate = useNavigate();

  /* --- Fetch Data --- */
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "banner",
    { category: "mediaHostingServicePage", is_active: true },
    { resource: "media" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "mediaHostingServicePage",
    { is_active: true },
    { resource: "media" }
  );

  const bannerItems = toArray(bannerRaw);
  const mediaCards = toArray(mediaCardsRaw);

  /* --- Hero Video --- */
  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length && !videoLoading) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured) || null);
  }, [videosRaw, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  /* -------------------------------
     JSX Render
  -------------------------------- */
  return (
    <main className="media-hosting-page">
      {/* 🎥 HERO SECTION */}
      <section className="media-hero-section">
        {videoUrl && !videoLoading ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="background-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onError={() => setVideoUrl(null)}
            />
            <div className="overlay-gradient" />
            <div className="hero-glass">
              <h1 className="hero-title">Media Hosting & Multimedia</h1>
              <p className="hero-subtitle">
                Professional media hosting, cloud streaming, and production services
                across Ghana and West Africa.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => navigate("/bookings")}>
                  Book Now
                </button>
                <button className="btn-secondary" onClick={() => navigate("/contact")}>
                  Contact Us
                </button>
              </div>
            </div>
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : (
          <BannerCards
            items={bannerItems}
            title="Capture & Host with Ethical Precision"
            loading={bannerLoading}
            fallbackTitle="Professional Multimedia Solutions"
          />
        )}
      </section>

      {/* 💡 SERVICE OVERVIEW */}
      <FadeInSection>
        <section className="content-section glass-panel">
          <header className="section-header">
            <h2 className="section-title">Our Multimedia & Hosting Solutions</h2>
            <p className="muted-text">
              From live event recording to cloud storage and streaming — Ethical Empire
              delivers secure, high-quality multimedia experiences in Ghana and across
              West Africa.
            </p>
          </header>
          <ServiceCategory category="mediaHostingServicePage" limit={6} />
        </section>
      </FadeInSection>

      {/* 🖼️ FEATURED MEDIA PROJECTS */}
      <FadeInSection>
        <section className="media-preview-section glass-panel">
          <h2 className="section-title">Featured Media Projects</h2>
          <div className="media-cards-scroll">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : Array.isArray(mediaCards) && mediaCards.length > 0 ? (
                  mediaCards.slice(0, 6).map((media, idx) => (
                    <MediaCard
                      key={media.id ?? media._id ?? media.url ?? idx}
                      media={media}
                    />
                  ))
                ) : (
                  <p className="muted-text">No media available at the moment.</p>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* 🧩 GALLERY */}
      <FadeInSection>
        <section className="gallery-section glass-panel">
          <h2 className="section-title">Our Multimedia Gallery</h2>
          <div className="card-grid">
            {mediaLoading
              ? Array.from({ length: 9 }).map((_, i) => <MediaSkeleton key={i} />)
              : Array.isArray(mediaCards) && mediaCards.length > 0 ? (
                  mediaCards.slice(0, 9).map((m, idx) => (
                    <MediaCard key={m.id ?? m._id ?? idx} media={m} />
                  ))
                ) : (
                  <p className="muted-text">No multimedia content available yet.</p>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* 💬 REVIEWS */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Testimonials"
          description="What our clients say about Ethical Empire’s media hosting and production services."
        >
          <Reviews limit={6} hideForm={true} category="mediaHostingServicePage" />
        </ReviewsLayout>
      </FadeInSection>

      {/* 🌐 OTHER SERVICES */}
      <FadeInSection>
        <section className="other-services-section glass-panel">
          <h2 className="section-title">Explore Our Other Services</h2>
          <p className="muted-text">
            Beyond media hosting, Ethical Empire offers full event solutions — from
            catering and décor to live entertainment and local foods across Ghana and
            West Africa.
          </p>

          <div className="other-services-grid">
            {[
              { title: "Live Band & Entertainment", link: "/services/live-band", image: livebandHero },
              { title: "Catering & Local Foods", link: "/services/catering", image: cateringWallpaper },
              { title: "Event Décor & Lighting", link: "/services/decor", image: stageDecor },
            ].map((s, idx) => (
              <div
                key={idx}
                className="other-service-card"
                onClick={() => navigate(s.link)}
              >
                <img src={s.image} alt={s.title} loading="lazy" />
                <div className="overlay">
                  <h3>{s.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>
    </main>
  );
}
