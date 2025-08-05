// frontend/src/components/Services.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import './Services.css';
import { toast } from 'react-toastify';

const fallbackDescriptions = {
  general: 'We offer high-quality, personalized services tailored to your unique needs. Our experienced professionals ensure top-notch service delivery and customer satisfaction.',
  consulting: 'Get expert advice to grow your business, optimize operations, and reach your goals faster. Our consultants bring years of industry experience and strategic insight.',
  development: 'From websites to full-scale platforms, our development team builds fast, secure, and scalable digital solutions.',
  design: 'Beautiful, modern, and user-focused design solutions to make your brand stand out and engage your audience.',
  marketing: 'Effective digital marketing strategies including SEO, social media, and paid campaigns to increase your visibility and conversions.',
};

const fallbackDetails = {
  general: [
    'Tailored support for individuals and teams',
    'Flexible pricing based on your needs',
    'Ongoing customer support and satisfaction monitoring',
  ],
  consulting: [
    'One-on-one business strategy sessions',
    'Detailed reports and roadmap planning',
    'Competitive market research and benchmarking',
  ],
  development: [
    'Frontend and backend development',
    'Mobile-responsive and cross-browser compatibility',
    'Custom CMS and integrations',
  ],
  design: [
    'Logo and branding packages',
    'Website and app UI/UX design',
    'Print and digital design assets',
  ],
  marketing: [
    'SEO optimization and audits',
    'Social media growth strategies',
    'Email marketing and automation',
  ],
};

const Services = () => {
  const { service } = useParams();
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
      const res = await publicAxios.get('/services/');
      if (Array.isArray(res.data.results) && res.data.results.length > 0) {
        const enriched = res.data.results.map((srv) => ({
          ...srv,
          description: srv.description || fallbackDescriptions[srv.slug] || fallbackDescriptions.general,
        }));
        setServices(enriched);
      } else {
        toast.warn('No services available at the moment.');
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error('Could not fetch services.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetail = async (slug) => {
    try {
      const res = await publicAxios.get(`/services/${slug}/`);
      const serviceData = res.data;
      setSelectedService({
        ...serviceData,
        description: serviceData.description || fallbackDescriptions[slug] || fallbackDescriptions.general,
        details: serviceData.details?.length ? serviceData.details : fallbackDetails[slug] || fallbackDetails.general,
      });
    } catch (error) {
      console.error('Failed to load service detail:', error);
      toast.error('Could not load service detail.');
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
          <p>{selectedService.description}</p>
          {selectedService.details?.length > 0 && (
            <ul>
              {selectedService.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}
          <Link to="/services" className="back-link">← Back to All Services</Link>
        </section>
      ) : (
        <>
          <h2>Our Services</h2>
          <section className="service-list">
            {services.map((srv, index) => (
              <div
                key={srv.id}
                className={`service-card ${flippedIndex === index ? 'flipped' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <h3>{srv.name}</h3>
                    <p className="short-description">
                      {srv.description?.slice(0, 60)}...
                    </p>
                  </div>
                  <div className="card-back">
                    <p>{srv.description}</p>
                    <Link to="/booking" className="book-btn">Book Now</Link>
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
// Company: Ethical Multimedia GH
