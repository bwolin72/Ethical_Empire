import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "react-icons/fa"; // fallback for dynamic icons
import "./Services.css";

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  // === Handle icon: support string from backend or React component ===
  const Icon =
    typeof service.icon === "string"
      ? Icons[service.icon] || Icons.FaCrown
      : service.icon || Icons.FaCrown;

  // === Handle routing dynamically ===
  const handleLearnMore = (e) => {
    e.stopPropagation();

    if (service?.slug) {
      navigate(`/services/${service.slug}`);
      return;
    }

    const name = service.name?.toLowerCase() || "";
    if (name.includes("cater")) navigate("/services/catering");
    else if (name.includes("band")) navigate("/services/live-band");
    else if (name.includes("decor")) navigate("/services/decor");
    else if (name.includes("media") || name.includes("host"))
      navigate("/services/media-hosting");
    else navigate("/services/general");
  };

  return (
    <motion.article
      className="service-card"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
    >
      <div className="card-inner">
        <div className="card-front">
          <div className="icon-wrap">
            <Icon size={48} className="service-icon" />
          </div>
          <h3 className="service-title">{service.name || "Unnamed Service"}</h3>
          <button className="book-btn" onClick={handleLearnMore}>
            Learn More →
          </button>
        </div>

        <div className="card-back">
          <p className="service-description">
            {service.description || "No description available."}
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
