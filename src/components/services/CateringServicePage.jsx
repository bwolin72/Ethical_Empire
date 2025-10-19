import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import serviceService from "../../api/services/serviceService";
import ServiceCategory from "./ServiceCategory";
import FadeInSection from "../FadeInSection";
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

/* === Skeleton for loading states === */
const SkeletonBox = ({ width = "100%", height = "20px", radius = "6px" }) => (
  <div
    className="skeleton-box"
    style={{
      width,
      height,
      borderRadius: radius,
      background:
        "linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%)",
      backgroundSize: "200% 100%",
      animation: "skeleton-loading 1.5s infinite",
    }}
  />
);

const CateringPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  /* === Motion Variants === */
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" },
    }),
  };

  /* === Fetch Data === */
  const fetchData = useCallback(async () => {
    try {
      setVideoUrl("/videos/catering-hero.mp4");

      const [cateringRes, allRes] = await Promise.all([
        serviceService.getServicesByCategory("Catering"),
        serviceService.getServices(),
      ]);

      const cateringData = Array.isArray(cateringRes.data)
        ? cateringRes.data
        : cateringRes.data?.results || [];

      const allData = Array.isArray(allRes.data)
        ? allRes.data
        : allRes.data?.results || [];

      setServices(cateringData);
      setOtherServices(allData.filter((s) => s.category !== "Catering"));
    } catch (err) {
      console.error("Error fetching catering data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  /* === Local Ghanaian Foods (with images) === */
  const localFoods = [
    { name: "Jollof Rice & Grilled Chicken", icon: <FaPepperHot />, image: jollofImg },
    { name: "Banku & Tilapia with Shito", icon: <FaFish />, image: bankuImg },
    { name: "Waakye with Gari & Stew", icon: <FaUtensils />, image: waakyeImg },
    { name: "Kenkey & Fried Fish", icon: <FaMortarPestle />, image: kenkeyImg },
    { name: "Fufu & Light Soup", icon: <FaDrumstickBite />, image: fufuImg },
    { name: "Ampesi with Kontomire Stew", icon: <FaAppleAlt />, image: ampesiImg },
    { name: "Kelewele & Groundnuts", icon: <FaCarrot />, image: keleweleImg },
  ];

  /* === West African & Global Varieties (with images) === */
  const globalVarieties = [
    { name: "Nigerian Party Jollof", icon: <FaPepperHot />, image: nigerianJollofImg },
    { name: "Senegalese Yassa Chicken", icon: <FaUtensils />, image: yassaImg },
    { name: "Ivorian Attiéké & Fish", icon: <FaFish />, image: attiekeImg },
    { name: "Continental Buffets", icon: <FaGlobeAmericas />, image: buffetImg },
    { name: "Asian Fusion & Stir Fry", icon: <FaLeaf />, image: asianImg },
    { name: "Mediterranean Platters", icon: <FaAppleAlt />, image: mediterraneanImg },
  ];

  /* === Dietary Options === */
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
        {videoUrl && !loading ? (
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
              <motion.h1 initial="hidden" animate="visible" variants={sectionVariants}>
                Ghanaian & West African Catering Excellence
              </motion.h1>
              <motion.p initial="hidden" animate="visible" variants={sectionVariants} custom={1}>
                Authentic local dishes and global gourmet experiences — from traditional Ghanaian
                recipes to world-class event catering.
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn btn-primary"
                onClick={() => navigate("/bookings")}
              >
                Request a Custom Menu
              </motion.button>
            </div>
            <button className="mute-button" onClick={toggleMute} aria-pressed={!isMuted}>
              {isMuted ? "🔇" : "🔊"}
            </button>
          </div>
        ) : (
          <div className="hero-fallback">
            <SkeletonBox width="70%" height="40px" />
            <SkeletonBox width="50%" height="20px" />
            <SkeletonBox width="160px" height="45px" />
          </div>
        )}
      </section>

      {/* === OUR CATERING SERVICES === */}
      <motion.section
        className="section services-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2 className="section-title">Our Catering Services</h2>
        {loading ? (
          <SkeletonBox height="120px" />
        ) : services.length > 0 ? (
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
      </motion.section>

      {/* === LOCAL FOODS (SEO SECTION) === */}
      <motion.section
        className="section local-foods-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2 className="section-title">Popular Local Foods in Ghana</h2>
        <p className="section-subtitle">
          We proudly serve the best of <strong>Ghanaian</strong> and{" "}
          <strong>West African cuisine</strong> — traditional recipes made with local ingredients
          and authentic flavors.
        </p>
        <div className="local-food-grid">
          {localFoods.map((item, i) => (
            <motion.div key={i} className="local-food-card" whileHover={{ scale: 1.07 }}>
              {item.image && <img src={item.image} alt={item.name} className="food-image" />}
              <span className="local-food-icon">{item.icon}</span>
              <span className="local-food-label">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === GLOBAL VARIETIES === */}
      <motion.section
        className="section world-food-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2 className="section-title">International & West African Varieties</h2>
        <p className="section-subtitle">
          Beyond local favorites, our culinary team creates{" "}
          <strong>continental, West African, and fusion delicacies</strong> that captivate guests at
          weddings, corporate events, and private parties.
        </p>
        <div className="world-grid">
          {globalVarieties.map((item, i) => (
            <motion.div key={i} className="world-card" whileHover={{ scale: 1.07 }}>
              {item.image && <img src={item.image} alt={item.name} className="food-image" />}
              <span className="world-icon">{item.icon}</span>
              <span className="world-label">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === DIETARY OPTIONS === */}
      <motion.section
        className="section dietary-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2 className="section-title">Special Dietary Options</h2>
        <div className="dietary-grid">
          {dietaryOptions.map(({ label, icon }, i) => (
            <motion.div key={i} className="dietary-card" whileHover={{ scale: 1.08 }}>
              <span className="dietary-icon">{icon}</span>
              <span>{label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* === MEDIA & REVIEWS === */}
      <FadeInSection>
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
                From <strong>party jollof</strong> to <strong>continental buffets</strong>, we bring
                cultural richness and gourmet excellence to every plate.
              </p>
            </div>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <ReviewsLayout
          title="What Our Clients Say"
          description="Here’s what people think about our Ghanaian and West African catering services."
        >
          <Reviews limit={6} hideForm={true} category="catering" />
        </ReviewsLayout>
      </FadeInSection>

      {/* === OTHER SERVICES === */}
      <motion.section
        className="section other-services-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2 className="section-title">Explore Our Other Services</h2>
        {loading ? (
          <SkeletonBox width="100%" height="120px" />
        ) : otherServices.length > 0 ? (
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
      </motion.section>
    </div>
  );
};

export default CateringPage;
