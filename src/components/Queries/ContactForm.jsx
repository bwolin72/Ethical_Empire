import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './ContactForm.css';
import logo from '../../assets/logo.png';

const enquiryOptions = ['', 'Services', 'Support', 'General', 'Feedback'];
const serviceOptions = [
  '', 'Live Band', 'DJ', 'Photography', 'Videography', 'Catering',
  'Event Planning', 'Lighting', 'MC/Host', 'Sound Setup'
];

const ContactForm = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', country: '', region: '',
    enquiry_type: '', service_type: '', event_date: '', description: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/contact/', {
        ...formData,
        service_type: formData.service_type || null,
        event_date: formData.event_date || null,
        description: formData.description || null,
      });

      setStatusMessage('✅ Message sent successfully!');
      setFormData({
        name: '', email: '', phone: '', country: '', region: '',
        enquiry_type: '', service_type: '', event_date: '', description: ''
      });
    } catch (error) {
      const errMsg = error.response?.data || '❌ Network error. Try again.';
      setStatusMessage(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  return (
    <div className={`contact-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="form-header centered-header">
        <img src={logo} alt="Ethical Multimedia GH Logo" className="logo" />
        <h2>Ethical Multimedia GH</h2>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="contact-grid">
        <section className="contact-form-section">
          <form onSubmit={handleSubmit} noValidate>
            {['name', 'email', 'phone', 'country', 'region'].map((field) => (
              <div className="form-group" key={field}>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              </div>
            ))}

            <div className="form-group">
              <select
                id="enquiry_type"
                name="enquiry_type"
                value={formData.enquiry_type}
                onChange={handleChange}
                required
              >
                {enquiryOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'Select enquiry type'}
                  </option>
                ))}
              </select>
              <label htmlFor="enquiry_type">Enquiry Type *</label>
            </div>

            <div className="form-group">
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
              >
                {serviceOptions.map(option => (
                  <option key={option} value={option}>
                    {option || 'Select service type'}
                  </option>
                ))}
              </select>
              <label htmlFor="service_type">Service Type (optional)</label>
            </div>

            <div className="form-group">
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
              />
              <label htmlFor="event_date">Event Date (optional)</label>
            </div>

            <div className="form-group full-width">
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder=" "
              ></textarea>
              <label htmlFor="description">Message (optional)</label>
            </div>

            <button className="submit-btn" type="submit">Submit</button>
          </form>

          {statusMessage && <div className="toast-notification">{statusMessage}</div>}
        </section>

        <section className="company-details-section">
          <div className="info-row">
            <div className="info-block">
              <h3>Manager</h3>
              <p><strong>Name:</strong> Mr. Nhyiraba Nanaba Joseph</p>
              <p><strong>Email:</strong> asaasebandeethm@gmail.com</p>
              <p><strong>Contact:</strong> +233 55 603 6565</p>
              <p><strong>WhatsApp:</strong> +233 55 298 8735</p>
            </div>
            <div className="info-block">
              <h3>Headquarters</h3>
              <p><strong>City:</strong> Gomoa Akotsi</p>
              <p><strong>District:</strong> Gomoa East</p>
              <p><strong>Region:</strong> Central Region</p>
              <p><strong>Location:</strong> Bicycle City</p>
            </div>
          </div>

          <div className="contact-buttons">
            <a href="https://wa.me/233556036565" className="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="tel:+233556036565" className="phone">Call</a>
          </div>

          <div className="social-media-links">
            <a href="https://www.instagram.com/example" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/company/example" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://twitter.com/example" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://www.facebook.com/example" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </section>
      </div>

      <section className="map-section">
        <h4>Our Location</h4>
        <iframe
          title="Ethical Multimedia GH Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.4429128830157!2d-0.5363832260168868!3d5.501059994478851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdfb390c81a1003%3A0x3a7e5b20542ee1e3!2sAKOTSI%20JUNCTION!5e0!3m2!1sen!2sin!4v1749910221020!5m2!1sen!2sin&output=embed"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactForm;
