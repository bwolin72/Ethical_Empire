// frontend/src/components/Services.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Music,
  Camera,
  Video,
  Calendar,
  Lightbulb,
  Mic,
  Speaker,
  Users,
} from "lucide-react"; // brand polish icons
import serviceService from "../../api/services/serviceService";
import "./Services.css";

// Map services to descriptions
const serviceDescriptions = {
  "Live Band":
    "Experience the soulful rhythms of Eethm_GH’s Live Band. From highlife to contemporary hits, we create unforgettable moments for weddings, parties, and corporate events.",
  DJ: "Our professional DJs keep the energy high and the dance floor alive, blending Ghanaian beats with global favorites for non-stop vibes.",
  Photography:
    "Capture timeless memories with Eethm_GH’s expert photographers. We turn fleeting moments into lasting treasures.",
  Videography:
    "Relive your event in stunning clarity. Our cinematic videography preserves every smile, laugh, and joyful tear.",
  Catering:
    "Taste Ghana’s finest flavors with our catering service. From authentic local dishes to gourmet creations, we serve with excellence.",
  "Event Planning":
    "From concept to completion, Eethm_GH designs seamless, stylish events so you can relax and enjoy the celebration.",
  Lighting:
    "Transform any venue with our dynamic lighting solutions, setting the perfect mood from elegant ambience to vibrant energy.",
  "MC/Host":
    "Keep your guests entertained with our charismatic MCs and hosts, delivering personality, flow, and professionalism.",
  "Sound Setup":
    "Clear, powerful, and perfectly tuned — our sound setup ensures every word and note is heard just right.",
};

// Map services to icons
const serviceIcons = {
  Catering: Utensils,
  DJ: Music,
  Photography: Camera,
  Videography: Video,
  "Event Planning": Calendar,
  Lighting: Lightbulb,
  "MC/Host": Mic,
  "Sound Setup": Speaker,
  "Live Band": Users,
};

const Services = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flippedIndex, setFlippedIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    setFlippedIndex(null);
    setSelectedService(null);

    if (slug) {
      fetchServiceDetail(slug);
    } else {
      fetchAllServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchAllServices = async () => {
    try {
      const res = await serviceService.getServices();
      const data = res?.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setServices(items);

      if (items.length === 0) {
        toast.warn("No services available at the moment.");
      }
    } catch (error) {
      console.error("❌ Failed to load services:", error?.response || error?.message);
      toast.error("Could not fetch services.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetail = async (slugValue) => {
    try {
      const res = await serviceService.getServiceDetail(slugValue);
      setSelectedService(res.data);
    } catch (error) {
      console.error("❌ Failed to load service detail:", error?.response || error?.message);
      toast.error("Could not load service detail.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (index) => {
    setFlippedIndex(index === flippedIndex ? null : index);
  };

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

  return (
    <div className="services-page">
      <AnimatePresence mode="wait">
        {selectedService ? (
          <motion.section
            key="service-detail"
            className="service-detail"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="gradient-text">{selectedService.name}</h2>
            <p>
              {serviceDescriptions[selectedService.name] ||
                "Premium service tailored to your unique event needs."}
            </p>
            <Link to="/services" className="back-link">
              ← Back to All Services
            </Link>
          </motion.section>
        ) : (
          <motion.div
            key="service-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="gradient-text">Our Services</h2>
            <section className="service-list">
              {services.map((srv, index) => {
                const Icon = serviceIcons[srv.name] || Users;
                return (
                  <motion.div
                    key={srv.slug || srv.id}
                    className={`service-card ${flippedIndex === index ? "flipped" : ""}`}
                    onClick={() => handleCardClick(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div className="card-inner">
                      {/* FRONT */}
                      <div className="card-front">
                        <Icon size={40} className="service-icon" />
                        <h3>{srv.name}</h3>
                        <button
                          className="book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/services/${srv.slug || srv.id}`);
                          }}
                        >
                          Learn More →
                        </button>
                      </div>
                      {/* BACK */}
                      <div className="card-back">
                        <p>
                          {serviceDescriptions[srv.name] ||
                            "Premium service tailored to your unique event needs."}
                        </p>
                        <div className="card-actions">
                          <Link
                            to="/bookings"
                            className="book-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Book Now
                          </Link>
                          <Link
                            to="/contact"
                            className="contact-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact Us
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
