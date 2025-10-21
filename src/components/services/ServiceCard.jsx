import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "react-icons/fa";
import "./Services.css";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  // === Handle icon dynamically (string from backend or component) ===
  const Icon =
    typeof service.icon === "string"
      ? Icons[service.icon] || Icons.FaCrown
      : service.icon || Icons.FaCrown;

  // === Routing logic (based on slug, category, or keywords) ===
  const handleLearnMore = (e) => {
    e.stopPropagation();

    if (service?.slug) {
      navigate(`/services/${service.slug}`);
      return;
    }

    const name = (service.name || "").toLowerCase();
    const category = (service.category || "").toLowerCase();

    if (name.includes("cater") || category.includes("cater")) {
      navigate("/services/catering");
    } else if (name.includes("band") || category.includes("band")) {
      navigate("/services/live-band");
    } else if (name.includes("decor") || category.includes("decor")) {
      navigate("/services/decor");
    } else if (
      name.includes("media") ||
      name.includes("host") ||
      category.includes("media")
    ) {
      navigate("/services/media-hosting");
    } else {
      navigate("/services/general");
    }
  };

  // === Card Animation variants ===
  const cardVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
  };

  return (
    <motion.article
      className="service-card glassmorphic-card"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap="whileTap"
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      layout
    >
      <div className="card-inner">
        {/* === FRONT SIDE === */}
        <div className="card-front">
          <div className="icon-wrap">
            <Icon size={48} className="service-icon" />
          </div>
          <h3 className="service-title">
            {service.name || "Unnamed Service"}
          </h3>
          <p className="service-category">
            {service.category || "General Service"}
          </p>
          <button className="book-btn" onClick={handleLearnMore}>
            Learn More →
          </button>
        </div>

        {/* === BACK SIDE === */}
        <div className="card-back">
          <p className="service-description">
            {service.description || "No description available for this service."}
          </p>

          <div className="card-actions">
            <Link to="/bookings" className="btn book-btn">
              Book Now
            </Link>
            <Link to="/contact" className="btn contact-btn">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ServiceCard;
