import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Services.css";

const ServiceCard = ({ service, isActive, onToggle }) => {
  const navigate = useNavigate();
  const Icon = service.icon;

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
          <button
            className="book-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/services/${service.name.toLowerCase()}`);
            }}
          >
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
