// frontend/src/components/Services.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import publicAxios from '../../api/publicAxios';
import './Services.css';
import { toast } from 'react-toastify';

const Services = () => {
  const { service } = useParams();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service) {
      fetchServiceDetail(service); // Optional, if slug-based detail is added
    } else {
      fetchAllServices();
    }
  }, [service]);

  const fetchAllServices = async () => {
    try {
      const res = await publicAxios.get('/services/');
      if (Array.isArray(res.data.results) && res.data.results.length > 0) {
        setServices(res.data.results);
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
      setSelectedService(res.data);
    } catch (error) {
      console.error('Failed to load service detail:', error);
      toast.error('Could not load service detail.');
    } finally {
      setLoading(false);
    }
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
          <p>{selectedService.description || 'No description provided.'}</p>
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
            {services.map((srv) => (
              <div key={srv.id} className="service-item">
                <h3>{srv.name}</h3>
                <p className="price">GH₵{srv.price}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Services;
