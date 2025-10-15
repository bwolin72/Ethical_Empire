import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import FadeInSection from "../FadeInSection";
import ServiceCategory from "./ServiceCategory";

import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";

import useFetcher from "../../hooks/useFetcher";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";

import "./MediaHostingServicePage.css";

// --- Helpers ---
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
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

export default function MediaHostingServicePage() {
  const navigate = useNavigate();

  // --- Fetch Data ---
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

  // --- Hero Video Setup ---
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

  const bannerItems = toArray(bannerRaw);
  const mediaCards = toArray(mediaCardsRaw);

  // --- Render ---
  return (
    <main className="media-hosting-page">
      {/* 🎥 HERO SECTION */}
      <section className="video-hero-section" aria-label="Hero Section">
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
            <div className="overlay-content animate-fade-in-up">
              <h1 className="hero-title">Media Hosting & Multimedia</h1>
              <p className="hero-subtitle">
                Capture, host and stream — professionally and reliably.
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
            <button
              className="mute-button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
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

      {/* 💡 SERVICE CATEGORIES */}
      <FadeInSection>
        <section className="content-section">
          <header className="section-header">
            <h2 className="section-title">Our Multimedia & Hosting Services</h2>
            <p className="muted-text">
              From event coverage to secure streaming and cloud hosting — Ethical Empire delivers complete
              multimedia experiences.
            </p>
          </header>
          <ServiceCategory category="mediaHostingServicePage" limit={6} />
        </section>
      </FadeInSection>

      {/* 🖼️ FEATURED PREVIEW */}
      <FadeInSection>
        <section className="media-preview-section">
          <h2 className="section-title">Featured Media Projects</h2>
          <div className="media-cards-scroll">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : mediaCards.length > 0 ? (
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
        <section className="gallery-section">
          <h2 className="section-title">Multimedia Gallery</h2>
          <div className="card-grid">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : mediaCards.length > 0 ? (
                  mediaCards.slice(0, 9).map((m, idx) => (
                    <MediaCard key={m.id ?? m._id ?? idx} media={m} />
                  ))
                ) : (
                  <p className="muted-text">No multimedia content available yet.</p>
                )}
          </div>
        </section>
      </FadeInSection>

      {/* 💬 CLIENT REVIEWS */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Impressions"
          description="What clients say about our multimedia and hosting services"
        >
          <Reviews limit={6} hideForm={true} category="mediaHostingServicePage" />
        </ReviewsLayout>
      </FadeInSection>
    </main>
  );
}
