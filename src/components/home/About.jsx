import React, { useEffect, useState } from 'react';
import {
  FaGuitar,
  FaCamera,
  FaUtensils,
  FaMicrophone,
  FaUsers,
  FaStar,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios'; // Switched to public instance
import MediaCard from '../context/MediaCard';
import './About.css';

const services = [
  {
    icon: <FaCamera />,
    title: 'Photography & Videography',
    desc: 'Capturing your moments with artistic precision and cinematic quality.',
  },
  {
    icon: <FaGuitar />,
    title: 'Live Band & DJ',
    desc: 'Electrify your event with soulful live performances and top-tier DJs.',
  },
  {
    icon: <FaUtensils />,
    title: 'Catering',
    desc: 'Serving delightful menus tailored for all occasions and tastes.',
  },
  {
    icon: <FaMicrophone />,
    title: 'Hosting & MC',
    desc: 'Engaging, charismatic hosts that keep your event flowing flawlessly.',
  },
  {
    icon: <FaUsers />,
    title: 'Event Coordination',
    desc: 'From concept to execution, we handle every detail professionally.',
  },
];

function About() {
  const [banners, setBanners] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  // const [error, setError] = useState(null); // Optional: show user-facing error

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [bannersRes, mediaRes, testimonialsRes] = await Promise.all([
          publicAxios.get('/service-app/media/?type=banner&endpoint=About'),
          publicAxios.get('/service-app/media/?type=media&endpoint=About'),
          publicAxios.get('/service-app/reviews/'),
        ]);
        setBanners(bannersRes.data);
        setMediaList(mediaRes.data);
        setTestimonials(testimonialsRes.data);
      } catch (error) {
        console.error('Error loading About page data:', error);
        // setError("Failed to load content. Please try again later.");
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="about-container">
      {/* Hero Banner */}
      {banners.length > 0 && (
        <div className="hero-banner mb-10">
          <MediaCard media={banners[0]} fullWidth />
        </div>
      )}

      {/* Introduction */}
      <div className="text-center mb-12">
        <h1 className="section-heading">Ethical Multimedia GH</h1>
        <p className="subtext">
          We don’t just provide services — we craft unforgettable experiences.
        </p>
      </div>

      {/* Additional Banners */}
      {banners.length > 1 && (
        <div className="about-banners mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {banners.slice(1).map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      )}

      {/* Services Section */}
      <div className="service-grid">
        {services.map(({ icon, title, desc }, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{icon}</div>
            <h3 className="service-title">{title}</h3>
            <p className="service-desc">{desc}</p>
          </div>
        ))}
      </div>

      {/* Who We Are */}
      <div className="about-text">
        <h2 className="section-heading">Who We Are</h2>
        <p>
          At <strong>Ethical Multimedia GH</strong>, we blend creativity with professionalism to deliver
          unforgettable event experiences. From vibrant live band performances and cinematic videography to
          breathtaking decor and seamless event management, our team is built to make your vision a reality.
          With over a decade of experience across weddings, concerts, and corporate functions, we execute
          with both precision and passion.
        </p>
      </div>

      {/* Media Gallery */}
      {mediaList.length > 0 && (
        <div className="about-gallery max-w-6xl mx-auto my-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mediaList.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      )}

      {/* Our Promise */}
      <div className="about-text">
        <h2 className="section-heading">Our Promise</h2>
        <p>
          Every service is guided by integrity, artistry, and a deep respect for your vision. We bring
          passion, precision, and professionalism to every celebration — whether it’s a wedding, concert,
          conference, or private party.
        </p>
      </div>

      {/* Why Choose Us */}
      <div className="why-section max-w-6xl mx-auto">
        <div>
          <h3 className="text-xl font-bold text-[#c9a356] mb-4">Why Choose Us?</h3>
          <ul>
            {[
              'Over a decade of experience in multimedia and live events.',
              'Dedicated team of skilled creatives and coordinators.',
              'State-of-the-art equipment and production standards.',
              'Client-first approach with flexible packages and honest pricing.',
              'Proven record of delivering flawless events across Ghana and beyond.',
            ].map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <FaStar className="text-[#c9a356] text-7xl" />
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="testimonial-section">
          <h2 className="section-heading">What Our Clients Say</h2>
          <div className="testimonial-grid">
            {testimonials.map((review) => (
              <div key={review.id} className="testimonial-card">
                <p>“{review.message}”</p>
                <p className="testimonial-author">— {review.reviewer_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="cta-section">
        <h3 className="text-xl font-semibold mb-3">Ready to plan something unforgettable?</h3>
        <Link to="/bookings" className="cta-button">
          Book Now
        </Link>
      </div>
    </div>
  );
}

export default About;
