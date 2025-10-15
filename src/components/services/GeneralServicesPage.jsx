import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import "./GeneralServicesPage.css";

// ✅ import hero and service images (so build works properly)
import heroImage from "../../assets/services/service-hero.png";
import photographyImg from "../../assets/services/photography.png";
import soundImg from "../../assets/services/sound.png";
import videographyImg from "../../assets/services/videography.png";
import mcImg from "../../assets/services/mc.png";
import eventPlanningImg from "../../assets/services/event-planning.png";
import djImg from "../../assets/services/dj.png";
import lightingImg from "../../assets/services/lighting.png";

const serviceList = [
  {
    title: "Photography",
    description:
      "Capture timeless moments with creative precision. We offer event, studio, and outdoor photography with professional editing.",
    image: photographyImg,
  },
  {
    title: "Sound Setup",
    description:
      "High-fidelity audio systems for concerts, conferences, and special events — with experienced engineers ensuring clarity and balance.",
    image: soundImg,
  },
  {
    title: "Videography",
    description:
      "From event coverage to cinematic storytelling, our videography service blends artistry and technology for stunning visuals.",
    image: videographyImg,
  },
  {
    title: "MC / Host",
    description:
      "Engaging, professional hosts to keep your event lively, interactive, and perfectly paced from start to finish.",
    image: mcImg,
  },
  {
    title: "Event Planning",
    description:
      "Comprehensive event management — from concept to execution — ensuring seamless coordination and creative excellence.",
    image: eventPlanningImg,
  },
  {
    title: "DJ",
    description:
      "Set the right mood with curated soundtracks. Our DJs mix genres and vibes that resonate with your audience and event theme.",
    image: djImg,
  },
  {
    title: "Lighting",
    description:
      "Transform spaces with creative lighting setups — from subtle ambience to dynamic stage effects.",
    image: lightingImg,
  },
];

export default function GeneralServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="general-services-page">
      {/* HERO SECTION */}
      <section
        className="hero-section"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.5)), url(${heroImage}) center/cover no-repeat`,
        }}
      >
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>All Our Event Services</h1>
          <p>
            One destination for photography, videography, sound, lighting, and
            every creative service your event needs.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/bookings")} className="btn-primary">
              Book a Service
            </button>
            <button onClick={() => navigate("/contact")} className="btn-secondary">
              Contact Us
            </button>
          </div>
        </motion.div>
      </section>

      {/* SERVICES GRID */}
      <FadeInSection>
        <section className="services-grid-section">
          <h2>Explore Our Expertise</h2>
          <p className="muted-text">
            Professional teams, cutting-edge equipment, and a passion for
            creativity — discover what we do best.
          </p>

          <div className="services-grid">
            {serviceList.map((service, index) => (
              <motion.div
                key={index}
                className="service-card"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div
                  className="service-image"
                  style={{ backgroundImage: `url(${service.image})` }}
                />
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button
                    className="btn-outline"
                    onClick={() => navigate("/bookings")}
                  >
                    Learn More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* CTA SECTION */}
      <FadeInSection>
        <section className="cta-section">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Need Multiple Services?</h2>
            <p>
              We can bundle photography, sound, lighting, and planning into one
              seamless experience — managed by the EETHM team.
            </p>
            <button className="btn-primary" onClick={() => navigate("/bookings")}>
              Book Multiple Services
            </button>
          </motion.div>
        </section>
      </FadeInSection>

      {/* REVIEWS SECTION */}
      <FadeInSection>
        <ReviewsLayout
          title="Client Impressions"
          description="What people say about our professional event services"
        >
          <Reviews limit={6} hideForm={true} category="generalServices" />
        </ReviewsLayout>
      </FadeInSection>
    </div>
  );
}
