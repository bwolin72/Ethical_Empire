// src/components/contact/ContactForm.jsx
import React, { useState } from 'react';
import contactService from '../../api/services/contactService';
import './ContactForm.css';
import logo from '../../assets/logo.png';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

const enquiryOptions = ['', 'Services', 'Support', 'General', 'Feedback'];
const serviceOptions = [
  '', 'Live Band', 'DJ', 'Photography', 'Videography', 'Catering',
  'Event Planning', 'Lighting', 'MC/Host', 'Sound Setup'
];

// Regex: accept local (e.g. 055xxxxxxx) or international (+233xxxxxxx)
const intlRegex = /^\+?[1-9]\d{8,14}$/;
const localRegex = /^0\d{9}$/;

const ContactForm = () => {
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

  /* ----------------- Handlers ----------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setStatusMessage('');
  };

  // Normalize phone to international format if local is used
  const normalizePhone = (phone) => {
    let cleaned = phone.trim().replace(/\s+/g, '');
    if (intlRegex.test(cleaned)) {
      if (!cleaned.startsWith('+')) cleaned = `+${cleaned}`;
      return cleaned;
    }
    if (localRegex.test(cleaned)) {
      return `+233${cleaned.slice(1)}`;
    }
    return null;
  };

  const validateClient = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';

    const normalizedPhone = normalizePhone(formData.phone);
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!normalizedPhone) {
      newErrors.phone = 'Enter a valid phone number (e.g. 055xxxxxxx or +233xxxxxxx).';
    }

    if (!formData.enquiry_type) newErrors.enquiry_type = 'Enquiry type is required.';
    if (formData.enquiry_type === 'Services' && !formData.service_type) {
      newErrors.service_type = 'Select a service type.';
    }
    if (formData.event_date) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(formData.event_date) < today) {
        newErrors.event_date = 'Event date cannot be in the past.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseServerErrors = (data) => {
    if (!data) return {};
    if (typeof data === 'string') return { _global: data };
    if (Array.isArray(data)) return { _global: data.join(' ') };
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : String(v)]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateClient()) {
      setStatusMessage('❌ Please fix errors and try again.');
      return;
    }

    const payload = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (!['country', 'region'].includes(k) && v) payload[k] = v;
    });

    payload.phone = normalizePhone(formData.phone);

    setLoading(true);
    try {
      const res = await contactService.send(payload);
      if (res.status === 201) {
        setStatusMessage('✅ Message sent successfully! We’ll be in touch.');
        setFormData({
          name: '', email: '', phone: '', country: '', region: '',
          enquiry_type: '', service_type: '', event_date: '', description: ''
        });
      }
    } catch (err) {
      const parsed = parseServerErrors(err?.response?.data);
      setErrors(parsed);
      setStatusMessage(parsed._global || '❌ Failed to send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- Render ----------------- */
  return (
    <div className="contact-page">
      {/* Header */}
      <header className="form-header animate-fade-in-up">
        <img src={logo} alt="EETHM Logo" className="logo" />
        <h2>Let’s Create Something Memorable</h2>
        <p className="slogan">Reach out to book our services or request more information</p>
      </header>

      {/* Grid */}
      <main className="contact-grid">
        {/* Form Section */}
        <section id="contact-form" className="contact-form-section animate-fade-in-up">
          <form onSubmit={handleSubmit} noValidate>
            {['name', 'email', 'phone'].map((field) => (
              <div className="form-group" key={field}>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  aria-invalid={!!errors[field]}
                />
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {errors[field] && <small className="error">{errors[field]}</small>}
              </div>
            ))}

            {/* Country + Region */}
            <div className="form-group">
              <CountryDropdown
                value={formData.country}
                onChange={(val) => setFormData(prev => ({ ...prev, country: val, region: '' }))}
                className="dropdown"
              />
              <label>Country</label>
            </div>
            <div className="form-group">
              <RegionDropdown
                country={formData.country}
                value={formData.region}
                onChange={(val) => setFormData(prev => ({ ...prev, region: val }))}
                className="dropdown"
              />
              <label>Region / State</label>
            </div>

            {/* Enquiry Type + Service */}
            <div className="form-group">
              <select name="enquiry_type" value={formData.enquiry_type} onChange={handleChange} required>
                {enquiryOptions.map(opt => <option key={opt} value={opt}>{opt || 'Select enquiry type'}</option>)}
              </select>
              <label>Enquiry Type *</label>
              {errors.enquiry_type && <small className="error">{errors.enquiry_type}</small>}
            </div>
            <div className="form-group">
              <select name="service_type" value={formData.service_type} onChange={handleChange}>
                {serviceOptions.map(opt => <option key={opt} value={opt}>{opt || 'Select service type'}</option>)}
              </select>
              <label>Service Type</label>
            </div>

            {/* Event Date */}
            <div className="form-group">
              <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} />
              <label>Event Date (optional)</label>
            </div>

            {/* Message */}
            <div className="form-group full-width">
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder=" "
              />
              <label>Message</label>
            </div>

            {/* Status + Submit */}
            {statusMessage && <div className="toast-notification">{statusMessage}</div>}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Submit'}
            </button>
          </form>
        </section>

        {/* Company Info */}
        <aside className="company-details-section animate-fade-in-up">
          <h2>Contact Details</h2>
          <div className="info-block">
            <h3>Co-Founder</h3>
            <p><strong>Name:</strong> Mr. Nhyira Nana Joseph</p>
            <p><strong>Email:</strong> info@eethmghmultimedia.com</p>
            <p><strong>Phone:</strong> +233 55 342 4865</p>
            <p><strong>WhatsApp:</strong> +233 55 924 1828</p>
          </div>
          <div className="info-block">
            <h3>Headquarters</h3>
            <p>Gomoa Akotsi, Gomoa East</p>
            <p>Central Region, Bicycle City, Ojobi</p>
          </div>

          <div className="contact-buttons">
            <a href="https://wa.me/233553424865" className="whatsapp">WhatsApp</a>
            <a href="tel:+233553424865" className="phone">Call</a>
          </div>

          <div className="social-media-links">
            <a href="https://www.instagram.com/ethicalmultimedia" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/in/ethical-empire/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://x.com/EeTHm_Gh" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://facebook.com/16nQGbE7Zk/" target="_blank" rel="noreferrer">Facebook</a>
          </div>
        </aside>
      </main>

      {/* Map Section */}
      <section className="map-section animate-fade-in-up">
        <h4>Our Location</h4>
        <iframe
          title="Ethical Multimedia GH Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.428661923482!2d-0.5330301294382339!3d5.503194382269809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzAnMTEuNSJOIDDCsDMyJzAwLjkiVw!5e0!3m2!1sen!2sgh!4v1693952745678!5m2!1sen!2sgh"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactForm;
