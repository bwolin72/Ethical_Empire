// src/components/booking/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import PhoneInput from 'react-phone-input-2';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { toast, ToastContainer } from 'react-toastify';
import {
  FaCalendarAlt,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaFacebookF,
} from 'react-icons/fa';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // <-- fixed path (components/context/AuthContext.js)
import useFetch from '../../hooks/useFetch';
import bookingService from '../../api/services/bookingService';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-phone-input-2/lib/style.css';
import 'react-toastify/dist/ReactToastify.css';
import './BookingForm.css';
import logo from '../../assets/logo.png';

const BookingForm = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Ghana',
    state_or_region: '',
    venue_name: '',
    address: '',
    event_date: null,
    message: '',
    services: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch services (useFetch should use axiosInstance/baseURL configured to your API base)
  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    refetch,
  } = useFetch('/services/');

  // prefill from logged in user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // convenience: normalize whichever shape servicesData has to an array
  const servicesList = (() => {
    if (!servicesData) return [];
    if (Array.isArray(servicesData)) return servicesData;
    if (Array.isArray(servicesData.results)) return servicesData.results;
    if (Array.isArray(servicesData.data)) return servicesData.data;
    return [];
  })();

  useEffect(() => {
    if (servicesData && servicesList.length === 0) {
      toast.warning('No services available at the moment.', { autoClose: 3000 });
    }
  }, [servicesData]); // eslint-disable-line

  useEffect(() => {
    if (servicesError) {
      toast.error('Failed to fetch services.', { autoClose: 3000 });
    }
  }, [servicesError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const id = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        services: checked
          ? [...new Set([...prev.services, id])]
          : prev.services.filter((s) => s !== id),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, event_date: date }));
  };

  const handlePhoneChange = (value) => {
    // value from react-phone-input-2 is numeric string without leading +
    const normalized = value ? `+${value}` : '';
    setFormData((prev) => ({ ...prev, phone: normalized }));
  };

  const resetForm = () => {
    setFormData({
      name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      country: 'Ghana',
      state_or_region: '',
      venue_name: '',
      address: '',
      event_date: null,
      message: '',
      services: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const {
      name,
      email,
      phone,
      country,
      state_or_region,
      venue_name,
      address,
      event_date,
      services,
    } = formData;

    // simple validations that match backend expectations
    if (
      !isAuthenticated ||
      !name ||
      !email ||
      !phone ||
      !country ||
      !state_or_region ||
      !venue_name ||
      !address ||
      !event_date ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      toast.error('Please complete all required fields and select at least one service.', {
        autoClose: 3000,
      });
      return;
    }

    // international phone format check: + followed by 8-15 digits
    if (!/^\+\d{8,15}$/.test(phone)) {
      toast.error('Please enter a valid international phone number.', { autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);

    // Prepare payload matching backend fields — backend expects event_date as YYYY-MM-DD
    const payload = {
      name,
      email,
      phone,
      country,
      state_or_region,
      venue_name,
      address,
      event_date: event_date ? event_date.toISOString().split('T')[0] : null,
      message: formData.message || '',
      services, // array of service ids
    };

    try {
      // bookingService.create -> hits /api/bookings/submit/ (publicAxios) per your bookingAPI
      const res = await bookingService.create(payload);

      // success feedback
      toast.success('🎉 Booking request submitted successfully!', { autoClose: 3000 });
      toast.info('📧 A confirmation email will be sent to you shortly.', { autoClose: 4000 });

      // clear & refetch
      resetForm();
      if (typeof refetch === 'function') refetch();
      return res;
    } catch (err) {
      // map backend validation errors to a human message
      const response = err?.response?.data;
      let msg = 'Error occurred submitting form.';
      if (response) {
        if (typeof response === 'string') msg = response;
        else if (Array.isArray(response)) msg = response.join(' ');
        else if (typeof response === 'object') {
          // prefer the first error value we can find
          const first = Object.values(response)[0];
          msg = Array.isArray(first) ? first[0] : first?.toString() || msg;
        }
      }
      toast.error(msg, { autoClose: 4000 });
      console.error('Booking submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`booking-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />

      <div className="booking-container">
        {/* === Left Side === */}
        <div className="booking-form-panel">
          <div className="form-header">
            <img src={logo} alt="Ethical Multimedia Logo" className="logo" />
            <h2>Ethical Multimedia GH</h2>
            <p className="subtitle">Premium Event Experience</p>
          </div>

          <form onSubmit={handleSubmit} className="form-content" noValidate>
            <h3>Event Booking Form</h3>

            {['name', 'email', 'venue_name', 'address'].map((id) => (
              <div key={id} className="input-group">
                <label htmlFor={id}>
                  {id.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
                <input
                  id={id}
                  name={id}
                  type={id === 'email' ? 'email' : 'text'}
                  value={formData[id]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="input-group">
              <label>Country</label>
              <CountryDropdown
                value={formData.country}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, country: val, state_or_region: '' }))
                }
              />
            </div>

            <div className="input-group">
              <label>State / Region</label>
              <RegionDropdown
                country={formData.country}
                value={formData.state_or_region}
                onChange={(val) => setFormData((prev) => ({ ...prev, state_or_region: val }))}
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <PhoneInput
                country="gh"
                value={(formData.phone || '').replace(/^\+/, '')}
                onChange={handlePhoneChange}
                inputProps={{ name: 'phone', required: true, autoComplete: 'tel' }}
                enableSearch
                enableAreaCodes
                international
                disableDropdown={false}
                preferredCountries={['gh', 'us', 'gb', 'ng', 'de']}
              />
            </div>

            <div className="input-group">
              <label>Event Date</label>
              <div className="datepicker-wrapper">
                <FaCalendarAlt className="icon" />
                <DatePicker
                  selected={formData.event_date}
                  onChange={handleDateChange}
                  placeholderText="Select a date"
                  dateFormat="yyyy-MM-dd"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Services</label>
              <div className="checkbox-group">
                {servicesLoading ? (
                  <p>Loading services...</p>
                ) : servicesList && servicesList.length > 0 ? (
                  servicesList.map((service) => (
                    <label key={service.id} className="checkbox-option">
                      <input
                        type="checkbox"
                        name="services"
                        value={service.id}
                        checked={formData.services.includes(service.id)}
                        onChange={handleChange}
                      />
                      {service.name || service.title || service.slug || `Service ${service.id}`}
                    </label>
                  ))
                ) : (
                  <p className="no-services">No services available</p>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Additional Notes</label>
              <textarea name="message" rows="4" value={formData.message} onChange={handleChange} />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </form>
        </div>

        {/* === Right Side === */}
        <div className="booking-brand-panel">
          <div className="brand-content">
            <h3>Operation Manager</h3>
            <p>
              <strong>Name:</strong> Mrs. Eunice Chai
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@eethmghmultimedia.com">info@eethmghmultimedia.com</a>
            </p>
            <p>
              <strong>Phone:</strong> <a href="tel:+233559241828">+233 55 924 1828</a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/233552988735" target="_blank" rel="noopener noreferrer">
                +233 55 298 8735
              </a>
            </p>

            <div className="location-block">
              <h3>Headquarters</h3>
              <p>
                <FaMapMarkerAlt className="icon" /> Bicycle City, Ojobi, Gomoa Akotsi
              </p>
              <p>Central Region, Ghana</p>
            </div>

            <div className="contact-buttons">
              <a
                href="https://wa.me/233553424865"
                className="whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp /> WhatsApp
              </a>
              <a href="tel:+233559241828" className="phone">
                <FaPhoneAlt /> Call Now
              </a>
            </div>

            <div className="social-media-links">
              <a href="https://www.instagram.com/ethicalmultimedia" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://www.linkedin.com/in/ethical-empire/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://x.com/EeTHm_Gh" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://www.facebook.com/16nQGbE7Zk/" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
