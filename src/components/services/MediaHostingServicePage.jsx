import React, { useEffect, useRef, useState } from "react";
import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import "./MediaHostingServicePage.css";
import { Card, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import API from "../../api/api";

const services = [
  {
    title: "📹 Videography Coverage",
    description:
      "From grand entrances to final goodbyes, we capture your event in vivid motion, preserving every emotion and detail with cinematic storytelling."
  },
  {
    title: "📸 Photography Sessions",
    description:
      "Professional, high-quality photos that freeze your best moments in time — from candid smiles to perfectly posed shots."
  },
  {
    title: "🚁 Drone Footage & Aerial Views",
    description:
      "Add a breathtaking perspective to your event with sweeping aerial shots that showcase the full beauty of your venue and moments."
  },
  {
    title: "📡 Live Streaming & Event Recording",
    description:
      "Bring your event to audiences anywhere with smooth, high-definition live streaming and reliable full-event recording."
  },
  {
    title: "🖼 Portrait & Studio Shoots",
    description:
      "Timeless portraits and creative studio photography that highlight personality, style, and unforgettable moments."
  },
  {
    title: "🎤 On-site Event Hosting",
    description:
      "Energetic, engaging, and professional hosting that keeps your audience entertained, informed, and connected throughout the event."
  }
];

const MediaHostingServicePage = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [flippedCard, setFlippedCard] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeroVideo = async () => {
      try {
        // Use apiService with API mapping
        const res = await apiService.getMedia("mediaHostingServicePage", {
          is_active: true,
          file_type: "video/",
          page_size: 1
        });

        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : res.data;

        if (results.length > 0 && results[0].url?.full) {
          setVideoUrl(results[0].url.full);
        }
      } catch (error) {
        console.error("Failed to load hero video:", error);
      }
    };

    fetchHeroVideo();
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleCardClick = (index) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  return (
    <div className="media-hosting-page">
      {/* === Hero Banner or Video === */}
      <section className="hero-banner">
        {videoUrl ? (
          <div className="video-wrapper">
            <video
              ref={videoRef}
              src={videoUrl}
              className="hero-video"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : (
          <BannerCards
            endpoint="mediaHostingServicePage"
            title="Capture & Host with Ethical Precision"
          />
        )}
      </section>

      {/* === Services Grid === */}
      <section className="section services-section">
        <h2 className="section-title">Our Multimedia & Hosting Services</h2>
        <div className="card-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`service-card-container ${
                flippedCard === index ? "flipped" : ""
              }`}
              onClick={() => handleCardClick(index)}
            >
              <motion.div className="service-card-inner">
                {/* Front Side */}
                <Card className="service-card-front">
                  <CardContent className="card-content">
                    <h3>{service.title}</h3>
                  </CardContent>
                </Card>

                {/* Back Side */}
                <Card className="service-card-back">
                  <CardContent className="card-content">
                    <p>{service.description}</p>
                    <button
                      className="cta-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/bookings");
                      }}
                    >
                      Book Now
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* === Creative Media Preview === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-text">
            <h3 className="section-subtitle">
              Visual Storytelling & Professional Coverage
            </h3>
            <p className="section-description">
              Whether it’s a corporate launch, private shoot, or public concert,
              Ethical Multimedia ensures every moment is captured in stunning
              clarity. From cinematic videography to detailed photography and
              reliable hosting— your memories and messages are in expert hands.
            </p>
          </div>
          <div className="creative-media">
            <MediaCards
              endpoint="mediaHostingServicePage"
              type="media"
              limit={3}
              fullWidth={false}
              supportPreview={true}
            />
          </div>
        </div>
      </section>

      {/* === Hosting Venue Info === */}
      <section className="section event-hosting-section">
        <h2 className="section-title">Hosting Event Place</h2>
        <p className="section-description">
          Need a location for your next shoot, seminar, or celebration? We offer
          fully equipped event spaces with lighting, seating, sound, and
          ambiance—ready for recording, streaming, or staging your unforgettable
          moment. Let us be your venue partner.
        </p>
      </section>

      {/* === Full Gallery === */}
      <section className="section">
        <h2 className="section-title">Multimedia Gallery</h2>
        <MediaCards
          endpoint="mediaHostingServicePage"
          type="media"
          limit={6}
          fullWidth={true}
          supportPreview={true}
        />
      </section>
    </div>
  );
};

export default MediaHostingServicePage;
