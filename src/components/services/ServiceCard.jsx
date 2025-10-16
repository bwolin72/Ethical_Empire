import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "react-icons/fa"; // fallback for dynamic icons
import "./Services.css";

const ServiceCard = ({ service, isActive, onToggle }) => {
  const navigate = useNavigate();

  // === Handle icon: support string from backend or React component ===
  const Icon =
    typeof service.icon === "string"
      ? Icons[service.icon] || Icons.FaCrown
      : service.icon || Icons.FaCrown;

  // === Handle routing ===
  const handleLearnMore = (e) => {
    e.stopPropagation();

    if (service?.slug) {
      navigate(`/services/${service.slug}`);
    } else {
      const name = service.name?.toLowerCase() || "";
      if (name.includes("cater")) navigate("/services/catering");
      else if (name.includes("band")) navigate("/services/live-band");
      else if (name.includes("decor")) navigate("/services/decor");
      else if (name.includes("media") || name.includes("host"))
        navigate("/services/media-hosting");
      else navigate("/services/general");
    }
  };

  return (
    <motion.article
      className={`service-card ${isActive ? "flipped" : ""}`}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onToggle}
      layout
    >
      <div className="card-inner">
        {/* === FRONT FACE === */}
        <div className="card-front">
          <div className="icon-wrap">
            <Icon size={48} className="service-icon" />
          </div>
          <h3 className="service-title">{service.name}</h3>
          {service.price && (
            <p className="service-price">
              {new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: "GHS",
              }).format(service.price)}
            </p>
          )}
          <button className="book-btn" onClick={handleLearnMore}>
            Learn More →
          </button>
        </div>

        {/* === BACK FACE === */}
        <div className="card-back">
          <p className="service-description">{service.description}</p>

          <div className="card-actions">
            <Link
              to="/bookings"
              className="btn book-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Book Now
            </Link>

            <Link
              to="/contact"
              className="btn contact-btn"
              onClick={(e) => e.stopPropagation()}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ServiceCard;
