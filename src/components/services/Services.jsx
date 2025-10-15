import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import serviceService from "../../api/services/serviceService";
import { serviceCategories } from "./data/serviceCategories";
import ServiceCategory from "./ServiceCategory";
import "./Services.css";

const Services = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);

  /* === Fetch Service Data (API + Fallback) === */
  useEffect(() => {
    const load = async () => {
      try {
        await serviceService.getServices();
      } catch (err) {
        console.warn("⚠️ Using static service data as fallback.");
        toast.info("Showing default service catalog...");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  /* === Remove ScrollReveal and Use CSS-only Visibility === */
  // Scroll reveal disabled to ensure hero always visible.

  /* === Loading State === */
  if (loading) {
    return (
      <div className="services-page loading-state">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading services...
        </motion.p>
      </div>
    );
  }

  /* === Main Render === */
  return (
    <div className="services-page">
      {/* === HERO SECTION === */}
      <header
        className="services-hero"
        aria-label="Eethm Multimedia Services Overview"
      >
        <motion.h1
          className="gradient-text hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Services
        </motion.h1>
        <p className="hero-subtitle">
          Complete multimedia, event, and entertainment solutions by{" "}
          <span className="brand-highlight">Eethm_GH Multimedia</span>.
        </p>
      </header>

      {/* === SERVICE CATEGORIES === */}
      <main>
        {serviceCategories.map((category) => (
          <ServiceCategory key={category.id} category={category} />
        ))}
      </main>

      {/* === CTA SECTION === */}
      <section className="services-cta">
        <h2>Ready to create unforgettable moments?</h2>
        <div className="cta-buttons">
          <Link to="/bookings" className="btn btn-primary">
            Book Now
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
