import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import serviceService from "../../api/services/serviceService";
import ServiceCategory from "./ServiceCategory";
import MediaCards from "../context/MediaCards";
import ReviewsLayout from "../user/ReviewsLayout";
import Reviews from "../user/Reviews";
import {
  FaLeaf,
  FaDrumstickBite,
  FaGlobeAmericas,
  FaUtensils,
  FaPepperHot,
  FaAppleAlt,
  FaCarrot,
  FaSeedling,
  FaFish,
  FaMortarPestle,
} from "react-icons/fa";
import "./catering.custom.css";

/* === IMAGE IMPORTS === */
import jollofImg from "../../assets/catering/jollof-chicken.png";
import bankuImg from "../../assets/catering/banku-tilapia.png";
import waakyeImg from "../../assets/catering/waakye.png";
import kenkeyImg from "../../assets/catering/kenkey.png";
import fufuImg from "../../assets/catering/fufu.jpeg";
import ampesiImg from "../../assets/catering/ampesi.jpeg";
import keleweleImg from "../../assets/catering/kelewele.jpeg";
import nigerianJollofImg from "../../assets/catering/nigerian-jollof.jpeg";
import yassaImg from "../../assets/catering/yassa-chicken.jpeg";
import attiekeImg from "../../assets/catering/attieke-fish.jpeg";
import buffetImg from "../../assets/catering/continental-buffet.jpeg";
import asianImg from "../../assets/catering/asian-fusion.jpeg";
import mediterraneanImg from "../../assets/catering/mediterranean.jpeg";

const CateringPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [videoUrl, setVideoUrl] = useState("/videos/catering-hero.mp4");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  /* === Fetch Services Data === */
  const fetchData = useCallback(async () => {
    try {
      const [cateringRes, allRes] = await Promise.all([
        serviceService.getServicesByCategory("Catering"),
        serviceService.getServices(),
      ]);

      const cateringData =
        Array.isArray(cateringRes.data) || Array.isArray(cateringRes.data?.results)
          ? cateringRes.data.results || cateringRes.data
          : [];

      const allData =
        Array.isArray(allRes.data) || Array.isArray(allRes.data?.results)
          ? allRes.data.results || allRes.data
          : [];

      setServices(cateringData);
      setOtherServices(allData.filter((s) => s.category !== "Catering"));
    } catch (err) {
      console.error("Error fetching catering data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (videoRef.current) videoRef.current.muted = !prev;
      return !prev;
    });
  };

  /* === Local & Global Foods === */
  const localFoods = [
    { name: "Jollof Rice & Grilled Chicken", icon: <FaPepperHot />, image: jollofImg },
    { name: "Banku & Tilapia with Shito", icon: <FaFish />, image: bankuImg },
    { name: "Waakye with Gari & Stew", icon: <FaUtensils />, image: waakyeImg },
    { name: "Kenkey & Fried Fish", icon: <FaMortarPestle />, image: kenkeyImg },
    { name: "Fufu & Light Soup", icon: <FaDrumstickBite />, image: fufuImg },
    { name: "Ampesi with Kontomire Stew", icon: <FaAppleAlt />, image: ampesiImg },
    { name: "Kelewele & Groundnuts", icon: <FaCarrot />, image: keleweleImg },
  ];

  const globalVarieties = [
    { name: "Nigerian Party Jollof", icon: <FaPepperHot />, image: nigerianJollofImg },
    { name: "Senegalese Yassa Chicken", icon: <FaUtensils />, image: yassaImg },
    { name: "Ivorian Attiéké & Fish", icon: <FaFish />, image: attiekeImg },
    { name: "Continental Buffets", icon: <FaGlobeAmericas />, image: buffetImg },
    { name: "Asian Fusion & Stir Fry", icon: <FaLeaf />, image: asianImg },
    { name: "Mediterranean Platters", icon: <FaAppleAlt />, image: mediterraneanImg },
  ];

  const dietaryOptions = [
    { label: "Vegan & Plant-Based Meals", icon: <FaLeaf /> },
    { label: "Halal & Kosher Options", icon: <FaFish /> },
    { label: "Gluten-Free & Low-Carb", icon: <FaSeedling /> },
    { label: "Keto-Friendly Meals", icon: <FaPepperHot /> },
  ];

  return (
    <div className="catering-page-container">
      {/* === HERO SECTION === */}
      <section className="catering-hero">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={videoUrl}
            className="hero-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
          <div className="overlay" />
          <div className="hero-content">
            <h1>Ghanaian & West African Catering Excellence</h1>
            <p>
              Authentic local dishes and global gourmet experiences — from traditional Ghanaian recipes
              to world-class event catering.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Request a Custom Menu
            </button>
          </div>
          <button className="mute-button" onClick={toggleMute}>
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </section>

      {/* === CATERING SERVICES === */}
      <section className="section services-section">
        <h2 className="section-title">Our Catering Services</h2>
        {services.length > 0 ? (
          <ServiceCategory
            category={{
              name: "Catering",
              services: services.map((srv) => ({
                name: srv.name,
                description: srv.description,
                icon: srv.icon || FaUtensils,
              })),
            }}
          />
        ) : (
          <p>No catering services available at the moment.</p>
        )}
      </section>

      {/* === LOCAL FOODS === */}
      <section className="section local-foods-section">
        <h2 className="section-title">Popular Local Foods in Ghana</h2>
        <p className="section-subtitle">
          We proudly serve the best of <strong>Ghanaian</strong> and <strong>West African cuisine</strong>.
        </p>
        <div className="local-food-grid">
          {localFoods.map((item, i) => (
            <div key={i} className="local-food-card">
              <img src={item.image} alt={item.name} className="food-image" />
              <span className="local-food-icon">{item.icon}</span>
              <span className="local-food-label">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === GLOBAL VARIETIES === */}
      <section className="section world-food-section">
        <h2 className="section-title">International & West African Varieties</h2>
        <p className="section-subtitle">
          Beyond local favorites, our culinary team crafts <strong>continental</strong> and <strong>fusion delicacies</strong>.
        </p>
        <div className="world-grid">
          {globalVarieties.map((item, i) => (
            <div key={i} className="world-card">
              <img src={item.image} alt={item.name} className="food-image" />
              <span className="world-icon">{item.icon}</span>
              <span className="world-label">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === DIETARY OPTIONS === */}
      <section className="section dietary-section">
        <h2 className="section-title">Special Dietary Options</h2>
        <div className="dietary-grid">
          {dietaryOptions.map(({ label, icon }, i) => (
            <div key={i} className="dietary-card">
              <span className="dietary-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === MEDIA & REVIEWS === */}
      <section className="section creative-section">
        <div className="creative-layout">
          <div className="creative-media">
            <MediaCards
              endpoint="CateringPage"
              type="media"
              title="Ghanaian Catering Moments"
              isFeatured
              isActive
            />
          </div>
          <div className="creative-text">
            <h3>Experience the Taste of Ghana & Beyond</h3>
            <p>
              From <strong>party jollof</strong> to <strong>continental buffets</strong>, we bring cultural richness to every event.
            </p>
          </div>
        </div>
      </section>

      <section className="section reviews-section">
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our catering services."
        >
          <Reviews limit={6} hideForm category="catering" />
        </ReviewsLayout>
      </section>

      {/* === OTHER SERVICES === */}
      <section className="section other-services-section">
        <h2 className="section-title">Explore Our Other Services</h2>
        {otherServices.length > 0 ? (
          <ServiceCategory
            category={{
              name: "Other Services",
              services: otherServices.map((srv) => ({
                name: srv.name,
                description: srv.description,
                icon: srv.icon || FaUtensils,
              })),
            }}
          />
        ) : (
          <p>No additional services found.</p>
        )}
      </section>
    </div>
  );
};

export default CateringPage;
