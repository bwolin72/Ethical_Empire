// src/components/contact/ContactForm.jsx
import React, { useState } from 'react';
import contactService from '../../api/services/contactService'; // ✅ use correct service
import './ContactForm.css';
import logo from '../../assets/logo.png';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

const enquiryOptions = ['', 'Services', 'Support', 'General', 'Feedback'];
const serviceOptions = [
  '', 'Live Band', 'DJ', 'Photography', 'Videography', 'Catering',
  'Event Planning', 'Lighting', 'MC/Host', 'Sound Setup'
];

const phoneRegex = /^\+?\d{9,15}$/; // matches +233XXXXXXXXX or 0XXXXXXXXX etc (9-15 digits)

const ContactForm = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    region: '',
    enquiry_type: '',
    service_type: '',
    event_date: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear field-level error while editing
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setStatusMessage('');
  };

  const validateClient = () => {
    const newErrors = {};
    // required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.enquiry_type) newErrors.enquiry_type = 'Enquiry type is required.';

    // phone format
    if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (e.g. +233XXXXXXXXX or 055XXXXXXX).';
    }

    // service_type required if enquiry_type === 'Services'
    if (formData.enquiry_type === 'Services' && !formData.service_type) {
      newErrors.service_type = "Service type is required when enquiry type is 'Services'.";
    }

    // event_date cannot be in the past (compare dates only)
    if (formData.event_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(formData.event_date);
      if (evDate < today) {
        newErrors.event_date = 'Event date cannot be in the past.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseServerErrors = (data) => {
    const parsed = {};
    if (!data) return parsed;
    if (typeof data === 'string') {
      parsed._global = data;
      return parsed;
    }
    if (Array.isArray(data)) {
      parsed._global = data.join(' ');
      return parsed;
    }
    Object.entries(data).forEach(([k, v]) => {
      if (Array.isArray(v)) parsed[k] = v.join(' ');
      else if (typeof v === 'object') parsed[k] = JSON.stringify(v);
      else parsed[k] = String(v);
    });
    return parsed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrors({});

    if (!validateClient()) {
      setStatusMessage('Please fix the errors and try again.');
      return;
    }

    // ✅ Build payload — omit frontend-only fields and blanks
    const payload = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (['country', 'region'].includes(k)) return; // skip unsupported
      if (v !== '' && v !== null && v !== undefined) {
        payload[k] = v;
      }
    });

    setLoading(true);
    try {
      const res = await contactService.send(payload);
      if (res.status === 201) {
        setStatusMessage('✅ Message sent successfully! We will be in touch.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: '',
          region: '',
          enquiry_type: '',
          service_type: '',
          event_date: '',
          description: ''
        });
        setErrors({});
      }
    } catch (err) {
      const serverData = err?.response?.data;
      const parsed = parseServerErrors(serverData);
      setErrors(parsed);
      if (parsed._global) setStatusMessage(parsed._global);
      else setStatusMessage('❌ Failed to send message. Please correct any errors and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`contact-page ${darkMode ? 'dark-mode' : ''}`}>
      <header className="form-header centered-header">
        <img src={logo} alt="Ethical Multimedia GH Logo" className="logo" />
        <h2>Ethical Multimedia GH</h2>
        <p className="slogan">Empowering Events – EETHM_GH</p>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          aria-pressed={darkMode}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </header>

      <main className="contact-grid">
        <section className="contact-form-section">
          <form onSubmit={handleSubmit} noValidate>
            {['name', 'email', 'phone'].map((field) => (
              <div className="form-group" key={field}>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  aria-invalid={!!errors[field]}
                />
                <label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {errors[field] && <small className="error">{errors[field]}</small>}
              </div>
            ))}

            <div className="form-group">
              <CountryDropdown
                value={formData.country}
                onChange={(val) =>
                  setFormData(prev => ({ ...prev, country: val, region: '' }))
                }
                className="country-dropdown"
                aria-label="Country"
              />
              <label>Country</label>
              {errors.country && <small className="error">{errors.country}</small>}
            </div>

            <div className="form-group">
              <RegionDropdown
                country={formData.country}
                value={formData.region}
                onChange={(val) =>
                  setFormData(prev => ({ ...prev, region: val }))
                }
                className="region-dropdown"
                aria-label="Region / State"
              />
              <label>Region / State</label>
              {errors.region && <small className="error">{errors.region}</small>}
            </div>

            <div className="form-group">
              <select
                id="enquiry_type"
                name="enquiry_type"
                value={formData.enquiry_type}
                onChange={handleChange}
                required
                aria-invalid={!!errors.enquiry_type}
              >
                {enquiryOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'Select enquiry type'}
                  </option>
                ))}
              </select>
              <label htmlFor="enquiry_type">Enquiry Type *</label>
              {errors.enquiry_type && <small className="error">{errors.enquiry_type}</small>}
            </div>

            <div className="form-group">
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                aria-invalid={!!errors.service_type}
              >
                {serviceOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'Select service type'}
                  </option>
                ))}
              </select>
              <label htmlFor="service_type">Service Type {formData.enquiry_type === 'Services' ? '*' : '(optional)'}</label>
              {errors.service_type && <small className="error">{errors.service_type}</small>}
            </div>

            <div className="form-group">
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                aria-invalid={!!errors.event_date}
              />
              <label htmlFor="event_date">Event Date (optional)</label>
              {errors.event_date && <small className="error">{errors.event_date}</small>}
            </div>

            <div className="form-group full-width">
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder=" "
                aria-invalid={!!errors.description}
              />
              <label htmlFor="description">Message (optional)</label>
              {errors.description && <small className="error">{errors.description}</small>}
            </div>

            {errors._global && <div className="form-error global-error">{errors._global}</div>}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Submit'}
            </button>
          </form>

          {statusMessage && (
            <div className="toast-notification" role="status" aria-live="polite">
              {statusMessage}
            </div>
          )}
        </section>

        <aside className="company-details-section">
          <div className="info-row">
            <div className="info-block">
              <h3>Co-Founder</h3>
              <p><strong>Name:</strong> Mr. Nhyira Nana Joseph</p>
              <p><strong>Email:</strong> info@eethmghmultimedia.com</p>
              <p><strong>Phone:</strong> +233 55 342 4865</p>
              <p><strong>WhatsApp:</strong> +233 55 924 1828</p>
            </div>
            <div className="info-block">
              <h3>Headquarters</h3>
              <p><strong>City:</strong> Gomoa Akotsi</p>
              <p><strong>District:</strong> Gomoa East</p>
              <p><strong>Region:</strong> Central Region</p>
              <p><strong>Location:</strong> Bicycle City, Ojobi</p>
            </div>
          </div>

          <div className="contact-buttons">
            <a
              href="https://wa.me/233553424865"
              className="whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href="tel:+233553424865" className="phone">Call</a>
          </div>

          <div className="social-media-links">
            <a
              href="https://www.instagram.com/ethicalmultimedia?igsh=NmVmdXV2dHhkdW4w"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/ethical-empire/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/EeTHm_Gh?t=DE32RjXhsgO6A_rgeGIFmA&s=09"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://facebook.com/16nQGbE7Zk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
        </aside>
      </main>

      <section className="map-section">
        <h4>Our Location</h4>
        <iframe
          title="Ethical Multimedia GH Location"
          src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3971.428661923482!2d-0.5330301294382339!3d5.503194382269809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sin!4v1755619633455!5m2!1sen!2sin"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactForm;
