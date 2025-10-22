import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import ServiceCategory from "./ServiceCategory";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import useFetcher from "../../hooks/useFetcher";
import "./decor.css";

import floralDecor from "../../assets/decor/floral-decor.png";
import lightingDecor from "../../assets/decor/lighting-decor.png";
import stageDecor from "../../assets/decor/stage-decor.png";
import decorHero from "../../assets/decor/decor-hero.png";

// Helper to normalize data
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

// Get usable media URL
const getMediaUrl = (m) => {
  const urls = [
    m?.secure_url,
    m?.url?.full,
    m?.url,
    m?.video_url,
    m?.video_file,
    m?.file_url,
    m?.file,
    m?.src,
    m?.path,
  ];
  return urls.find((x) => typeof x === "string" && x.trim() !== "") || "";
};

export default function DecorServicePage() {
  const navigate = useNavigate();

  // Fetch videos & media
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "decor",
    { is_active: true },
    { resource: "videos" }
  );
  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "decor",
    { is_active: true },
    { resource: "media" }
  );

  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const mediaCards = toArray(mediaCardsRaw);

  // Mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  // Set featured video if available
  useEffect(() => {
    const videos = toArray(videosRaw);
    if (!videos.length) return setVideoUrl(null);
    const featured = videos.find((v) => v?.is_featured) ?? videos[0];
    setVideoUrl(getMediaUrl(featured));
  }, [videosRaw, videoLoading]);

  // Decor service categories
  const decorCategories = [
    {
      name: "Floral & Table Decor",
      image: floralDecor,
      services: [
        {
          name: "Luxury Floral Arrangements",
          description:
            "Elegant centerpiece & aisle florals tailored to your event theme.",
        },
        {
          name: "Table Styling",
          description:
            "Custom linens, cutlery, and accent decor for a cohesive luxury look.",
        },
        {
          name: "Backdrop Flowers",
          description:
            "Stunning floral walls and stage florals ideal for weddings and ceremonies.",
        },
      ],
    },
    {
      name: "Lighting & Ambience",
      image: lightingDecor,
      services: [
        {
          name: "Mood Lighting",
          description:
            "Create ambience with golden glow or soft pastels matching your brand colors.",
        },
        {
          name: "Lanterns & Chandeliers",
          description:
            "Elegant hanging decor perfect for luxury Ghanaian weddings & galas.",
        },
        {
          name: "LED Installations",
          description:
            "Dynamic event lighting for concerts, ceremonies, and corporate nights.",
        },
      ],
    },
    {
      name: "Stage & Venue Design",
      image: stageDecor,
      services: [
        {
          name: "Stage Backdrops",
          description:
            "Theme-based or floral backdrops for premium West African events.",
        },
        {
          name: "Draping & Ceiling Work",
          description:
            "Soft fabrics & ambient glow to elevate visual flow.",
        },
        {
          name: "Entrance & Aisle Decor",
          description:
            "Create unforgettable first impressions for your guests.",
        },
      ],
    },
  ];

  return (
    <main className="decor-page-container">

      {/* ================= HERO ================= */}
      <section className="decor-hero-section">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1 className="hero-title">Decor & Event Design</h1>
              <p className="hero-subtitle">
                Transforming spaces across Ghana and West Africa with artistic floral design, immersive lighting, and bespoke venue styling.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  Book Decor Service
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    document
                      .querySelector(".decor-services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  View Gallery
                </button>
              </div>
            </div>
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </>
        ) : (
          <div
            className="hero-fallback"
            style={{
              backgroundImage: `url(${decorHero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1 className="hero-title">Elegant Decor & Styling</h1>
              <p className="hero-subtitle">
                Experience luxury design artistry for weddings, corporate, and cultural events.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ================= DECOR CATEGORIES ================= */}
      <section className="decor-services">
        <h2 className="section-title">Our Decor Services</h2>
        <p className="section-description">
          From floral compositions to ambient lighting, we craft timeless atmospheres for your events.
        </p>

        <div className="decor-category-grid">
          {decorCategories.map((cat, i) => (
            <div key={i} className="decor-category-card">
              <div className="decor-category-image-wrapper">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="decor-category-image"
                  loading="lazy"
                />
              </div>
              <ServiceCategory category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="gallery-section">
        <h2 className="section-title">Decor Highlights</h2>
        <p className="section-description">
          Explore our signature setups — elegant, cinematic, and locally inspired.
        </p>

        <div className="gallery-grid">
          {mediaLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <MediaSkeleton key={i} />
              ))
            : mediaCards.length > 0
            ? mediaCards.map((m, i) => (
                <MediaCard key={m.id ?? i} media={m} />
              ))
            : <p className="muted-text">No media available yet.</p>}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <ReviewsLayout
        title="Client Impressions"
        description="What our clients say about their Decor experiences"
      >
        <Reviews limit={6} hideForm={true} category="decor" />
      </ReviewsLayout>
    </main>
  );
}
