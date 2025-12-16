import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FadeInSection from "../FadeInSection";
import Reviews from "../user/Reviews";
import ReviewsLayout from "../user/ReviewsLayout";
import "./GeneralServicesPage.css";

// Import hero and service images
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
    description: "Capture timeless moments with creative precision. We offer event, studio, and outdoor photography with professional editing.",
    image: photographyImg,
    theme: "multimedia"
  },
  {
    title: "Sound Setup",
    description: "High-fidelity audio systems for concerts, conferences, and special events — with experienced engineers ensuring clarity and balance.",
    image: soundImg,
    theme: "multimedia"
  },
  {
    title: "Videography",
    description: "From event coverage to cinematic storytelling, our videography service blends artistry and technology for stunning visuals.",
    image: videographyImg,
    theme: "multimedia"
  },
  {
    title: "MC / Host",
    description: "Engaging, professional hosts to keep your event lively, interactive, and perfectly paced from start to finish.",
    image: mcImg,
    theme: "live-band"
  },
  {
    title: "Event Planning",
    description: "Comprehensive event management — from concept to execution — ensuring seamless coordination and creative excellence.",
    image: eventPlanningImg,
    theme: "decor"
  },
  {
    title: "DJ",
    description: "Set the right mood with curated soundtracks. Our DJs mix genres and vibes that resonate with your audience and event theme.",
    image: djImg,
    theme: "live-band"
  },
  {
    title: "Lighting",
    description: "Transform spaces with creative lighting setups — from subtle ambience to dynamic stage effects.",
    image: lightingImg,
    theme: "multimedia"
  },
];

export default function GeneralServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="general-services-page theme-multimedia">
      {/* HERO SECTION */}
      <section className="services-hero">
        <div className="hero-overlay" />
        <div className="hero-background" style={{ backgroundImage: `url(${heroImage})` }} />
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
            <button onClick={() => navigate("/bookings")} className="btn btn-primary">
              Book a Service
            </button>
            <button onClick={() => navigate("/contact")} className="btn btn-secondary">
              Contact Us
            </button>
          </div>
        </motion.div>
      </section>

      {/* SERVICES GRID */}
      <FadeInSection>
        <section className="services-grid-section">
          <div className="section-header">
            <h2>Explore Our Expertise</h2>
            <p className="section-subtitle">
              Professional teams, cutting-edge equipment, and a passion for
              creativity — discover what we do best.
            </p>
          </div>

          <div className="services-grid">
            {serviceList.map((service, index) => (
              <motion.div
                key={index}
                className={`service-card theme-${service.theme}`}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div
                  className="service-image"
                  style={{ backgroundImage: `url(${service.image})` }}
                />
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button
                    className="btn btn-outline"
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
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Book Multiple Services
            </button>
          </motion.div>
        </section>
      </FadeInSection>

      {/* REVIEWS SECTION */}
      <FadeInSection>
        <section className="reviews-section">
          <ReviewsLayout
            title="Client Impressions"
            description="What people say about our professional event services"
          >
            <Reviews limit={6} hideForm={true} category="generalServices" />
          </ReviewsLayout>
        </section>
      </FadeInSection>
    </div>
  );
}
