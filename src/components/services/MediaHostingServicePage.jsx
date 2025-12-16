import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";
import ServiceCategory from "./ServiceCategory";
import BannerCards from "../context/BannerCards";
import MediaCard from "../context/MediaCards";
import MediaSkeleton from "../context/MediaSkeleton";
import useFetcher from "../../hooks/useFetcher";

import livebandHero from "../../assets/liveband/liveband-hero.jpg";
import cateringWallpaper from "../../assets/images/catering-wallpaper.jpg";
import stageDecor from "../../assets/decor/stage-decor.png";
import cameraCrew from "../../assets/services/photography.png";
import studioSetup from "../../assets/services/sound.png";
import droneAerial from "../../assets/media/drone-aerial.jpg";

import "./MediaHostingServicePage.css";

/* Lazy-load heavier sections */
const Reviews = lazy(() => import("../user/Reviews"));
const ReviewsLayout = lazy(() => import("../user/ReviewsLayout"));

/* Helpers */
const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (Array.isArray(payload.data)) return payload.data.filter(Boolean);
  if (typeof payload === "object")
    return Object.values(payload).flat().filter(Boolean);
  return [];
};

const getMediaUrl = (media) => {
  const candidates = [
    media?.video_url,
    media?.secure_url,
    media?.url?.full,
    media?.url,
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

  /* --- Fetch Dynamic Data --- */
  const { data: videosRaw, loading: videoLoading } = useFetcher(
    "videos",
    "MediaHostingServicePage",
    { is_active: true },
    { resource: "videos" }
  );

  const { data: bannerRaw, loading: bannerLoading } = useFetcher(
    "media",
    "MediaHostingServicePage",
    { type: "banner", is_active: true },
    { resource: "media" }
  );

  const { data: mediaCardsRaw, loading: mediaLoading } = useFetcher(
    "media",
    "MediaHostingServicePage",
    { type: "media", is_active: true },
    { resource: "media" }
  );

  // ✅ fetch real backend services (Videography & Photography)
  const { data: servicesRaw, loading: servicesLoading } = useFetcher(
    "services",
    "MediaHostingServicePage",
    { name__in: ["Videography", "Photography"], is_active: true },
    { resource: "services" }
  );

  const bannerItems = useMemo(() => toArray(bannerRaw), [bannerRaw]);
  const mediaCards = useMemo(() => toArray(mediaCardsRaw), [mediaCardsRaw]);
  const videos = useMemo(() => toArray(videosRaw), [videosRaw]);
  const services = useMemo(() => toArray(servicesRaw), [servicesRaw]);

  /* --- Video Hero Logic --- */
  const [videoUrl, setVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videos.length > 0 && !videoLoading) {
      const featured = videos.find((v) => v?.is_featured) ?? videos[0];
      const rawUrl = getMediaUrl(featured);
      if (rawUrl) {
        const optimized = rawUrl.replace(
          "/upload/",
          "/upload/q_auto:eco,f_auto,w_1280/"
        );
        setVideoUrl(optimized);
      }
    }
  }, [videos, videoLoading]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  /* --- Fallback static services --- */
  const staticMediaServices = [
    {
      id: "local-1",
      name: "Drone & Aerial Videography",
      description:
        "Cinematic aerial coverage for concerts, weddings, and corporate events.",
      image: droneAerial,
    },
    {
      id: "local-2",
      name: "Studio Production & Editing",
      description:
        "Full in-house audio-visual editing, mastering, and color grading.",
      image: studioSetup,
    },
    {
      id: "local-3",
      name: "On-site Camera Crew",
      description:
        "Professional on-site camera crew for real-time media coverage.",
      image: cameraCrew,
    },
  ];

  /* --- Other services grid --- */
  const otherServices = useMemo(
    () => [
      {
        name: "Live Band & Entertainment",
        link: "/services/live-band",
        image: livebandHero,
        theme: "live-band"
      },
      {
        name: "Catering & Local Foods",
        link: "/services/catering",
        image: cateringWallpaper,
        theme: "catering"
      },
      { 
        name: "Event Décor & Lighting", 
        link: "/services/decor", 
        image: stageDecor,
        theme: "decor"
      },
    ],
    []
  );

  /* -------------------------------
     JSX Render
  -------------------------------- */
  return (
    <main className="media-hosting-page theme-multimedia">
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
              preload="metadata"
              loading="lazy"
              onError={() => setVideoUrl(null)}
            />
            <div className="overlay-gradient" />
            <div className="hero-content">
              <h1 className="hero-title">Media Hosting & Multimedia</h1>
              <p className="hero-subtitle">
                Professional cloud-based media hosting, live event recording,
                and high-fidelity production across Ghana and West Africa.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/bookings")}
                >
                  Book Now
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/contact")}
                >
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
            name="Capture & Host with Ethical Precision"
            loading={bannerLoading}
            fallbackName="Professional Multimedia Solutions"
          />
        )}
      </section>

      {/* 💡 SERVICE OVERVIEW */}
      <FadeInSection>
        <section className="section services-section">
          <header className="section-header">
            <h2 className="section-title">Our Multimedia & Hosting Solutions</h2>
            <p className="section-description">
              From live production and recording to online streaming and
              post-editing — Ethical Empire delivers secure, world-class
              multimedia experiences.
            </p>
          </header>

          {!servicesLoading && services.length > 0 ? (
            <ServiceCategory
              category={{ name: "Media Hosting Services", services }}
            />
          ) : (
            <div className="services-grid">
              {staticMediaServices.map((s) => (
                <div key={s.id} className="service-card">
                  <img src={s.image} alt={s.name} loading="lazy" />
                  <div className="service-info">
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </FadeInSection>

      {/* 🖼️ FEATURED MEDIA PROJECTS */}
      <FadeInSection>
        <section className="section media-gallery-section">
          <h2 className="section-title">Featured Media Projects</h2>
          <p className="section-description">
            Explore our portfolio of professional media productions
          </p>
          <div className="media-cards-grid">
            {mediaLoading
              ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
              : mediaCards.length > 0
              ? mediaCards
                  .slice(0, 6)
                  .map((media, idx) => (
                    <MediaCard
                      key={media.id ?? media._id ?? media.url ?? idx}
                      media={media}
                    />
                  ))
              : <p className="empty-state">No media available at the moment.</p>}
          </div>
        </section>
      </FadeInSection>

      {/* 💬 REVIEWS */}
      <FadeInSection>
        <Suspense fallback={<div className="loading-reviews">Loading Reviews...</div>}>
          <section className="section reviews-section">
            <ReviewsLayout
              title="Client Testimonials"
              description="What our clients say about Ethical Empire's media hosting and production services."
            >
              <Reviews limit={6} hideForm={true} category="MediaHostingServicePage" />
            </ReviewsLayout>
          </section>
        </Suspense>
      </FadeInSection>

      {/* 🌐 OTHER SERVICES */}
      <FadeInSection>
        <section className="section other-services-section">
          <h2 className="section-title">Explore Our Other Services</h2>
          <p className="section-description">
            Beyond multimedia, Ethical Empire offers full event solutions —
            from décor and catering to entertainment and lighting.
          </p>
          <div className="other-services-grid">
            {otherServices.map((s, idx) => (
              <div
                key={idx}
                className={`other-service-card theme-${s.theme}`}
                onClick={() => navigate(s.link)}
              >
                <img src={s.image} alt={s.name} loading="lazy" />
                <div className="service-overlay">
                  <h3>{s.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>
    </main>
  );
}
