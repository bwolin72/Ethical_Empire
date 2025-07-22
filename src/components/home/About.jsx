import React from 'react';
import {
  FaGuitar,
  FaCamera,
  FaUtensils,
  FaMicrophone,
  FaUsers,
  FaStar,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import useMediaFetcher from '../../hooks/useMediaFetcher';
import MediaCard from '../context/MediaCards';
import MediaCards from '../context/MediaCards';
import BannerCards from '../context/BannerCards';
import publicAxios from '../../api/publicAxios';

import './About.css';

const services = [
  {
    icon: <FaCamera />,
    title: 'Photography & Videography',
    desc: 'Capturing your story with cinematic quality and artistic flair.',
  },
  {
    icon: <FaGuitar />,
    title: 'Live Band & DJ',
    desc: 'Soulful live music and high-energy DJ performances to energize your event.',
  },
  {
    icon: <FaUtensils />,
    title: 'Catering',
    desc: 'Customized culinary experiences crafted to suit every palate and occasion.',
  },
  {
    icon: <FaMicrophone />,
    title: 'Hosting & MC',
    desc: 'Charismatic, engaging hosts that keep your event seamless and vibrant.',
  },
  {
    icon: <FaUsers />,
    title: 'Event Coordination',
    desc: 'From concept to cleanup, we manage every detail so you don’t have to.',
  },
];

const About = () => {
  const {
    media: bannerList,
    loading: bannerLoading,
  } = useMediaFetcher({
    type: 'banner',
    endpoint: 'About',
    isActive: true,
    pageSize: 1,
  });

  const [testimonials, setTestimonials] = React.useState([]);

  // Fetch testimonials (not using the hook)
  React.useEffect(() => {
    publicAxios.get('/reviews/')
      .then(res => setTestimonials(res.data || []))
      .catch(err => console.error('Testimonials fetch error:', err));
  }, []);

  return (
    <div className="about-container">

      {/* === Hero Banner === */}
      {bannerList.length > 0 && (
        <div className="hero-banner mb-10">
          <MediaCard media={bannerList[0]} fullWidth />
        </div>
      )}

      {/* === Intro Text === */}
      <section className="text-center mb-12 px-4">
        <h1 className="section-heading">Ethical Multimedia GH</h1>
        <p className="subtext">
          We don’t just offer services — we deliver lasting impressions.
        </p>
      </section>

      {/* === Banners Grid === */}
      <BannerCards endpoint="About" title="Explore Our Visual Stories" />

      {/* === Our Services === */}
      <section className="service-grid px-4">
        {services.map(({ icon, title, desc }, idx) => (
          <div key={idx} className="service-card">
            <div className="service-icon">{icon}</div>
            <h3 className="service-title">{title}</h3>
            <p className="service-desc">{desc}</p>
          </div>
        ))}
      </section>

      {/* === Who We Are === */}
      <section className="about-text px-4 mt-12">
        <h2 className="section-heading">Who We Are</h2>
        <p>
          At <strong>Ethical Multimedia GH</strong>, we merge artistic passion with event precision.
          From vibrant performances and stunning visuals to coordinated event execution, we bring your vision to life with professionalism and creativity.
          <br /><br />
          With over a decade of experience across weddings, concerts, and corporate events,
          our diverse team brings the tools and talent to turn ideas into unforgettable experiences.
        </p>
      </section>

      {/* === Media Gallery === */}
      <MediaCards endpoint="About" type="featured" title="Our Work in Action" fullWidth />

      {/* === Our Commitment === */}
      <section className="about-text px-4 mt-12">
        <h2 className="section-heading">Our Commitment</h2>
        <p>
          We value integrity, artistry, and a deep understanding of your goals.
          Every event is approached with care, strategy, and passion — ensuring it's not just successful, but unforgettable.
        </p>
      </section>

      {/* === Why Choose Us === */}
      <section className="why-section max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center mt-16 px-4">
        <div>
          <h3 className="text-xl font-bold text-[#c9a356] mb-4">Why Clients Trust Us</h3>
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

      {/* === Testimonials === */}
      {testimonials.length > 0 && (
        <section className="testimonial-section px-4 mt-16">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="testimonial-grid">
            {testimonials.map((review) => (
              <div key={review.id} className="testimonial-card">
                <p>“{review.message}”</p>
                <p className="testimonial-author">— {review.reviewer_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === Call to Action === */}
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
