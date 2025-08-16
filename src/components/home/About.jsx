// src/components/pages/About.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useMediaFetcher from '../../hooks/useMediaFetcher';
import MediaCards from '../context/MediaCards';
import MediaCard from '../context/MediaCard';
import BannerCards from '../context/BannerCards';
import apiService from '../../api/apiService';
import './About.css';

const About = () => {
  const { media: bannerList = [] } = useMediaFetcher({
    type: 'banner',
    endpoint: 'About',
    isActive: true,
    pageSize: 1,
  });

  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [videoHeroUrl, setVideoHeroUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllServices = async () => {
      try {
        const res = await apiService.getServices();
        const serviceList = res.data?.results || res.data || [];
        if (Array.isArray(serviceList) && serviceList.length > 0) {
          if (isMounted) setServices(serviceList);
        } else {
          toast.warn('No services available at the moment.');
        }
      } catch (error) {
        console.error('Services fetch error:', error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const { data } = await apiService.getReviews();
        if (isMounted) setTestimonials(data || []);
      } catch (error) {
        console.error('Testimonials fetch error:', error);
      }
    };

    const fetchVideoHero = async () => {
      try {
        const { data } = await apiService.getVideos({
          endpoint: 'About',
          is_active: true,
        });

        const videoList = Array.isArray(data) ? data : [];
        const featured = videoList.find((v) => v.is_featured) || videoList[0];

        if (featured?.video_file && isMounted) {
          setVideoHeroUrl(featured.video_file);
        }
      } catch (error) {
        console.error('Hero video fetch error:', error);
      }
    };

    // ✅ call correct functions
    fetchAllServices();
    fetchTestimonials();
    fetchVideoHero();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="about-container">
      <div className="sticky-cta-bar">
        <Link to="/bookings">Let’s Talk</Link>
      </div>

      {/* === Hero Video or Banner === */}
      {videoHeroUrl ? (
        <div className="hero-banner video">
          <video
            src={videoHeroUrl}
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
          />
        </div>
      ) : bannerList.length > 0 ? (
        <div className="hero-banner mb-10">
          <MediaCard media={bannerList[0]} fullWidth />
        </div>
      ) : null}

      <section className="text-center mb-12 px-4">
        <h1 className="section-heading">Ethical Multimedia GH</h1>
        <p className="subtext">
          We don’t just offer services — we deliver lasting impressions.
        </p>
      </section>

      <BannerCards endpoint="About" title="Explore Our Visual Stories" />

      {/* === Services Grid === */}
      {services.length > 0 && (
        <section className="service-grid px-4">
          {services.map(({ id, icon_url, title, description }) => (
            <div key={id} className="service-card">
              {icon_url && (
                <img src={icon_url} alt={title} className="service-icon-img" />
              )}
              <h3 className="service-title">{title}</h3>
              <p className="service-desc">{description}</p>
            </div>
          ))}
        </section>
      )}

      <section className="about-text px-4 mt-12">
        <h2 className="section-heading">Who We Are</h2>
        <p>
          At <strong>Ethical Multimedia GH</strong>, we merge artistic passion
          with event precision. From vibrant performances and stunning visuals
          to coordinated event execution, we bring your vision to life with
          professionalism and creativity.
          <br />
          <br />
          With over a decade of experience across weddings, concerts, and
          corporate events, our diverse team brings the tools and talent to turn
          ideas into unforgettable experiences.
        </p>
      </section>

      <MediaCards
        endpoint="About"
        type="media"
        title="Our Work in Action"
        fullWidth
        isFeatured={true}
      />

      <section className="about-text px-4 mt-12">
        <h2 className="section-heading">Our Commitment</h2>
        <p>
          We value integrity, artistry, and a deep understanding of your goals.
          Every event is approached with care, strategy, and passion — ensuring
          it's not just successful, but unforgettable.
        </p>
      </section>

      <section className="why-section max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center mt-16 px-4">
        <div>
          <h3 className="text-xl font-bold text-[#c9a356] mb-4">
            Why Clients Trust Us
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            {[
              'Over a decade of multimedia and event expertise.',
              'A versatile team of creatives, planners, and performers.',
              'Cutting-edge equipment and visual production.',
              'Flexible packages and transparent pricing.',
              'A track record of flawless delivery across Ghana and beyond.',
            ].map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <FaStar className="text-[#c9a356] text-7xl" />
        </div>
      </section>

      <section className="team-section px-4 mt-16 text-center">
        <h2 className="section-heading">Meet the Team</h2>
        <p className="mb-6">
          Behind every successful event is a passionate team of visionaries,
          creators, and coordinators.
        </p>
        <div className="team-grid">
          <div className="team-member">
            <img src="../../../src/team/eunice.jpg" alt="Eunice" />
            <h4>Mrs. Eunice Chai</h4>
            <p>Operation Manager</p>
          </div>
          <div className="team-member">
            <img src="../../../src/team/joseph.jpg" alt="Joseph" />
            <h4>Mr. Nhyira Nana Joseph</h4>
            <p>Event Manager</p>
          </div>
        </div>
      </section>

      <section className="press-logos px-4 mt-16">
        <h2 className="section-heading text-center">Trusted By</h2>
        <div className="logo-carousel">
          <img src="/logos/client1.png" alt="Client 1" />
          <img src="/logos/client2.png" alt="Client 2" />
          <img src="/logos/client3.png" alt="Client 3" />
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="testimonial-carousel px-4 mt-16 text-center">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="carousel-wrapper">
            {testimonials.map((review, idx) => (
              <div key={idx} className="testimonial-slide">
                <p>“{review.message}”</p>
                <p className="testimonial-author">
                  — {review.reviewer_name || 'Anonymous'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta-section text-center mt-16 px-4">
        <h3 className="text-xl font-semibold mb-3">
          Let’s create something remarkable together.
        </h3>
        <Link to="/bookings" className="cta-button">
          Book a Service
        </Link>
      </section>
    </div>
  );
};

export default About;
