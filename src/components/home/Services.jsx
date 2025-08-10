// frontend/src/components/Services.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiService from "../../api/apiService";
import "./Services.css";

const serviceDescriptions = {
  "Live Band":
    "Experience the soulful rhythms of Eethm_GH’s Live Band. From highlife to contemporary hits, we create unforgettable moments for weddings, parties, and corporate events.",
  DJ:
    "Our professional DJs keep the energy high and the dance floor alive, blending Ghanaian beats with global favorites for non-stop vibes.",
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

const Services = () => {
  const { service } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flippedIndex, setFlippedIndex] = useState(null);

  useEffect(() => {
    if (service) {
      fetchServiceDetail(service);
    } else {
      fetchAllServices();
    }
  }, [service]);

  const fetchAllServices = async () => {
    try {
      const res = await apiService.getServices();
      const serviceList = res.data.results || res.data;
      if (Array.isArray(serviceList) && serviceList.length > 0) {
        setServices(serviceList);
      } else {
        toast.warn("No services available at the moment.");
      }
    } catch (error) {
      console.error("❌ Failed to load services:", error);
      toast.error("Could not fetch services.");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetail = async (idOrSlug) => {
    try {
      const res = await apiService.getServiceDetail(idOrSlug);
      setSelectedService(res.data);
    } catch (error) {
      console.error("❌ Failed to load service detail:", error);
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
      <div className="services-page">
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="services-page">
      {selectedService ? (
        <section className="service-detail">
          <h2>{selectedService.name}</h2>
          <p>
            {serviceDescriptions[selectedService.name] ||
              "Premium service tailored to your unique event needs."}
          </p>
          <Link to="/services" className="back-link">
            ← Back to All Services
          </Link>
        </section>
      ) : (
        <>
          <h2>Our Services</h2>
          <section className="service-list">
            {services.map((srv, index) => (
              <div
                key={srv.id || srv.name}
                className={`service-card ${
                  flippedIndex === index ? "flipped" : ""
                }`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  {/* FRONT */}
                  <div className="card-front">
                    <h3>{srv.name}</h3>
                    <button
                      className="book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/services/${srv.id}`);
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
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Services;
