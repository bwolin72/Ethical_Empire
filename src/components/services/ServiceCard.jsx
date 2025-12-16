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

  // === Theme mapping for service cards ===
  const getThemeForService = (service) => {
    const name = service.name?.toLowerCase() || "";
    const category = service.category?.toLowerCase() || "";
    
    if (name.includes("cater") || category.includes("cater") || name.includes("food") || name.includes("bar")) {
      return "catering";
    } else if (name.includes("band") || category.includes("band") || name.includes("music") || name.includes("live")) {
      return "live-band";
    } else if (name.includes("decor") || category.includes("decor") || name.includes("styling") || name.includes("floral")) {
      return "decor";
    } else if (name.includes("media") || name.includes("host") || name.includes("photo") || name.includes("video") || 
               name.includes("sound") || name.includes("light") || name.includes("dj") || name.includes("mc")) {
      return "multimedia";
    } else if (name.includes("event") || name.includes("management") || name.includes("planning") || name.includes("coordinat")) {
      return "travel"; // Using travel theme for management
    } else {
      return "multimedia"; // Default
    }
  };

  const serviceTheme = getThemeForService(service);

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
    } else if (name.includes("band") || category.includes("band") || name.includes("music") || name.includes("live")) {
      navigate("/services/live-band");
    } else if (name.includes("decor") || category.includes("decor") || name.includes("styling")) {
      navigate("/services/decor");
    } else if (name.includes("media") || name.includes("host") || category.includes("media")) {
      navigate("/services/media-hosting");
    } else {
      navigate("/services/general");
    }
  };

  // === Card Animation variants ===
  const cardVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.03, y: -8 },
    whileTap: { scale: 0.97 },
  };

  return (
    <motion.article
      className={`service-card theme-${serviceTheme}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap="whileTap"
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      layout
    >
      <div className="card-inner">
        {/* === SERVICE ICON & BASIC INFO === */}
        <div className="card-header">
          <div className="icon-wrap">
            <Icon size={48} className="service-icon" />
          </div>
          <h3 className="service-title">
            {service.name || "Unnamed Service"}
          </h3>
          {service.category && (
            <p className="service-category">
              {service.category}
            </p>
          )}
        </div>

        {/* === SERVICE DESCRIPTION === */}
        <div className="card-body">
          <p className="service-description">
            {service.description || "No description available for this service."}
          </p>
          
          {service.price && (
            <div className="service-price">
              <span className="price-label">Starting from</span>
              <span className="price-value">{service.price}</span>
            </div>
          )}
        </div>

        {/* === CARD ACTIONS === */}
        <div className="card-actions">
          <button 
            className="btn btn-learn-more" 
            onClick={handleLearnMore}
          >
            Learn More →
          </button>
          <div className="action-buttons">
            <Link to="/bookings" className="btn btn-primary">
              Book Now
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ServiceCard;
