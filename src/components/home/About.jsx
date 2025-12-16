import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Target, Award, Heart, Star, Sparkles } from "lucide-react";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import MediaGallery from "../gallery/MediaGallery";
import Services from "../services/Services";
import ReviewsLayout from "../user/ReviewsLayout";
import Reviews from "../user/Reviews";
import useFetcher from "../../hooks/useFetcher";

import josephImg from "../../assets/team/joseph.jpg";
import euniceImg from "../../assets/team/eunice.png";

import "./About.css";

const About = () => {
  const navigate = useNavigate();

  // ===== Fetch Dynamic Content =====
  const { data: videos = [], loading: vLoad } = useFetcher("videos", "about");
  const { data: media = [], loading: mLoad } = useFetcher("media", "about");
  const { data: banners = [], loading: bLoad } = useFetcher("promotions", "about");

  const [heroVideos, setHeroVideos] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    // Prepare hero videos
    const videoData = Array.isArray(videos) && videos.length >= 2 
      ? videos.slice(0, 2) 
      : [];
    
    setHeroVideos(videoData);

    // Prepare gallery items
    const mediaItems = [...(videos || []), ...(media || [])].filter(Boolean);
    setGalleryItems(mediaItems);
  }, [videos, media]);

  const teamMembers = [
    { 
      name: "Joseph", 
      role: "Event Director", 
      img: josephImg,
      bio: "Specializes in live entertainment and technical production with 10+ years of experience.",
      expertise: ["Live Band", "Sound Engineering", "Event Planning"]
    },
    { 
      name: "Eunice", 
      role: "Creative Director", 
      img: euniceImg,
      bio: "Leads design and creative vision for events, ensuring every detail tells a story.",
      expertise: ["Decor Design", "Floral Arrangements", "Theme Development"]
    },
  ];

  const companyValues = [
    { icon: <Heart size={24} />, title: "Passion", description: "We pour heart into every event" },
    { icon: <Target size={24} />, title: "Excellence", description: "Commitment to quality and precision" },
    { icon: <Users size={24} />, title: "Collaboration", description: "Working closely with clients and partners" },
    { icon: <Award size={24} />, title: "Innovation", description: "Creative solutions and modern techniques" },
  ];

  const milestones = [
    { year: "2020", title: "Company Founded", description: "Started with live band services" },
    { year: "2021", title: "Service Expansion", description: "Added multimedia and catering divisions" },
    { year: "2022", title: "Regional Growth", description: "Expanded across Ghana and West Africa" },
    { year: "2023", title: "Premium Partnerships", description: "Collaborated with luxury venues and brands" },
  ];

  return (
    <div className="about-page">
      {/* === HERO SECTION === */}
      <section className="about-hero-section">
        <div className="hero-background">
          <div className="hero-gradient-overlay" />
          {heroVideos.length > 0 ? (
            <div className="hero-video-grid">
              {heroVideos.map((vid, i) => (
                <video
                  key={i}
                  src={vid?.url?.full || vid?.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="hero-video"
                />
              ))}
            </div>
          ) : (
            <div className="hero-static-background" />
          )}
        </div>

        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Our Story</span>
          </div>
          <h1 className="hero-title">The EETHM_GH Experience</h1>
          <p className="hero-subtitle">
            Professional event services that transform visions into unforgettable moments across Ghana
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/bookings")}>
              Book Now
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/contact")}>
              Contact Us
            </button>
          </div>
        </motion.div>
      </section>

      {/* === INTRODUCTION SECTION === */}
      <section className="section intro-section">
        <div className="section-container">
          <div className="intro-header">
            <div className="section-badge">
              <Target size={16} />
              <span>Our Mission</span>
            </div>
            <h2 className="section-title">Crafting Exceptional Experiences</h2>
          </div>
          
          <div className="intro-grid">
            <motion.div 
              className="intro-content"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="intro-text">
                At <strong className="brand-highlight">EETHM_GH Multimedia</strong>, we blend 
                creativity with technical expertise to deliver exceptional event services. 
                From soulful live performances to elegant decor and professional multimedia 
                production, we're dedicated to making every celebration memorable.
              </p>
              <p className="intro-text">
                Founded with a passion for entertainment and a commitment to excellence, 
                we've grown into a comprehensive event solutions provider serving clients 
                across Ghana and West Africa.
              </p>
              <div className="intro-stats">
                <div className="stat">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Events</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5+</span>
                  <span className="stat-label">Years</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Team Members</span>
                </div>
                <div className="stat">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Satisfaction</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="intro-values"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3>Our Core Values</h3>
              <div className="values-grid">
                {companyValues.map((value, index) => (
                  <div key={index} className="value-card">
                    <div className="value-icon">{value.icon}</div>
                    <div className="value-content">
                      <h4>{value.title}</h4>
                      <p>{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === MILESTONES TIMELINE === */}
      <section className="section milestones-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Award size={16} />
              <span>Our Journey</span>
            </div>
            <h2 className="section-title">Milestones & Growth</h2>
          </div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div 
                key={index}
                className="timeline-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === SERVICES SHOWCASE === */}
      <section className="section services-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={16} />
              <span>Our Expertise</span>
            </div>
            <h2 className="section-title">Comprehensive Event Solutions</h2>
            <p className="section-description">
              From concept to completion, we provide professional services for every aspect of your event
            </p>
          </div>
          
          <div className="services-showcase">
            <Services />
          </div>
        </div>
      </section>

      {/* === TEAM SECTION === */}
      <section className="section team-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Users size={16} />
              <span>Our Team</span>
            </div>
            <h2 className="section-title">Meet Our Leadership</h2>
            <p className="section-description">
              Passionate professionals dedicated to delivering exceptional event experiences
            </p>
          </div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="team-card-image">
                  <img src={member.img} alt={member.name} loading="lazy" />
                  <div className="team-overlay" />
                </div>
                <div className="team-card-content">
                  <h3>{member.name}</h3>
                  <div className="team-role">{member.role}</div>
                  <p className="team-bio">{member.bio}</p>
                  <div className="team-expertise">
                    {member.expertise.map((skill, i) => (
                      <span key={i} className="expertise-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === GALLERY SHOWCASE === */}
      <section className="section gallery-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Work in Action</h2>
            <p className="section-description">
              A visual journey through our most memorable projects and events
            </p>
          </div>
          
          {!mLoad && (
            <div className="media-showcase">
              {media.length > 0 ? (
                <MediaCards endpointKey="about" resourceType="media" />
              ) : (
                <MediaGallery items={galleryItems} />
              )}
            </div>
          )}
        </div>
      </section>

      {/* === REVIEWS SECTION === */}
      <section className="section reviews-section">
        <div className="section-container">
          <ReviewsLayout
            title="Client Testimonials"
            description="Hear from clients who have experienced the EETHM difference"
          >
            <Reviews limit={6} hideForm />
          </ReviewsLayout>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="section cta-section">
        <div className="section-container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="cta-badge">
              <Star size={20} />
              <span>Ready to Work With Us?</span>
            </div>
            <h2>Let's Create Something Amazing Together</h2>
            <p>
              Contact us today to discuss your event vision and discover how we can bring it to life
            </p>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={() => navigate("/contact")}>
                Get In Touch
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/bookings")}>
                Book a Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
