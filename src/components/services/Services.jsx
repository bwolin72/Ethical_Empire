import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import serviceService from "../../api/services/serviceService";
import { serviceCategories as fallbackCategories } from "./data/serviceCategories";
import ServiceCategory from "./ServiceCategory";
import "./Services.css";

const Services = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  /* === Fetch Service Categories (API + Fallback) === */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await serviceService.getNestedCategories();
        if (Array.isArray(res?.data) && res.data.length > 0) {
          setCategories(res.data);
        } else {
          console.warn("⚠️ Unexpected API structure, loading fallback.");
          setCategories(fallbackCategories);
          toast.info("Showing default service catalog...");
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch categories, using fallback.", err);
        setCategories(fallbackCategories);
        toast.info("Showing default service catalog...");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [slug]);

  /* === Loading Animation === */
  if (loading) {
    return (
      <div className="services-page loading-state">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            repeatType: "reverse",
          }}
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
      <header className="services-hero" aria-label="Eethm Multimedia Services Overview">
        <motion.h1
          className="gradient-text hero-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Services
        </motion.h1>
        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Complete multimedia, event, and entertainment solutions by{" "}
          <span className="brand-highlight">Eethm_GH Multimedia</span>.
        </motion.p>
      </header>

      {/* === SERVICE CATEGORIES === */}
      <main>
        {categories.length > 0 ? (
          categories.map((category) => (
            <motion.section
              key={category.id || category.slug || category.name}
              className="category-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <ServiceCategory category={category} />
            </motion.section>
          ))
        ) : (
          <p className="muted-text center">
            No service categories available at the moment.
          </p>
        )}
      </main>

      {/* === CTA SECTION === */}
      <section className="services-cta">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to create unforgettable moments?
        </motion.h2>

        <motion.div
          className="cta-buttons"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/bookings" className="btn btn-primary">
            Book Now
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Contact Us
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;
