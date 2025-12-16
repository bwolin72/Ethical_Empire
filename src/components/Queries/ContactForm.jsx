import React, { useState } from "react";
import contactService from "../../api/services/contactService";
import "./ContactForm.css";
import logo from "../../assets/logo.png";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import SocialHub from "../social/SocialHub";

// Options
const enquiryOptions = ["", "Services", "Support", "General", "Feedback"];
const serviceOptions = [
  "",
  "Live Band",
  "DJ",
  "Photography",
  "Videography",
  "Catering",
  "Event Planning",
  "Lighting",
  "MC/Host",
  "Sound Setup",
];

// Regex
const intlRegex = /^\+?[1-9]\d{8,14}$/;
const localRegex = /^0\d{9}$/;

// Contact info
const contactInfo = {
  coFounder: {
    name: "Mr. Nhyira Nana Joseph",
    email: "info@eethmghmultimedia.com",
    phone: "+233 55 342 4865 / +233 55 924 1828",
    whatsapp: "+233552988735",
  },
  headquarters: [
    "Gomoa Akotsi, Gomoa East",
    "Central Region, Bicycle City, Ojobi",
  ],
};

// Initial form state
const initialForm = {
  name: "",
  email: "",
  phone: "",
  country: "",
  region: "",
  enquiry_type: "",
  service_type: "",
  event_date: "",
  description: "",
};

const ContactForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setStatusMessage("");
  };

  // Phone normalization
  const normalizePhone = (phone) => {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (intlRegex.test(cleaned)) return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    if (localRegex.test(cleaned)) return `+233${cleaned.slice(1)}`;
    return null;
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    const { name, email, phone, enquiry_type, service_type, event_date } = formData;

    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";

    const normalizedPhone = normalizePhone(phone);
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!normalizedPhone) newErrors.phone = "Enter a valid phone number.";

    if (!enquiry_type) newErrors.enquiry_type = "Enquiry type is required.";
    if (enquiry_type === "Services" && !service_type) newErrors.service_type = "Select a service type.";

    if (event_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(event_date) < today) newErrors.event_date = "Event date cannot be in the past.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Server error parser
  const parseServerErrors = (data) => {
    if (!data) return {};
    if (typeof data === "string") return { _global: data };
    if (Array.isArray(data)) return { _global: data.join(" ") };
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : String(v)])
    );
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setStatusMessage("❌ Please fix errors and try again.");
      return;
    }

    const payload = { ...formData, phone: normalizePhone(formData.phone) };
    delete payload.country;
    delete payload.region;

    setLoading(true);
    try {
      const res = await contactService.send(payload);
      if (res.status === 201) {
        setStatusMessage("✅ Message sent successfully! We'll be in touch.");
        setFormData(initialForm);
      }
    } catch (err) {
      const parsed = parseServerErrors(err?.response?.data);
      setErrors(parsed);
      setStatusMessage(parsed._global || "❌ Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Custom dropdown handler for react-country-region-selector
  const handleCountryChange = (val) => {
    setFormData((p) => ({ ...p, country: val, region: "" }));
    setErrors((prev) => ({ ...prev, country: undefined }));
  };

  const handleRegionChange = (val) => {
    setFormData((p) => ({ ...p, region: val }));
    setErrors((prev) => ({ ...prev, region: undefined }));
  };

  return (
    <div className="contact-page animate-fade-in-up">
      <header className="form-header">
        <img src={logo} alt="EETHM Logo" className="logo" />
        <h2>Let's Create Something Memorable</h2>
        <p className="slogan">Reach out to book our services or request more information</p>
      </header>

      <main className="contact-layout">
        <section className="contact-form-section">
          <form onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder=" "
                aria-invalid={!!errors.name}
                className={errors.name ? "input-error" : ""}
              />
              <label>Name *</label>
              {errors.name && <small className="error">{errors.name}</small>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                aria-invalid={!!errors.email}
                className={errors.email ? "input-error" : ""}
              />
              <label>Email *</label>
              {errors.email && <small className="error">{errors.email}</small>}
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" "
                aria-invalid={!!errors.phone}
                className={errors.phone ? "input-error" : ""}
              />
              <label>Phone Number *</label>
              {errors.phone && <small className="error">{errors.phone}</small>}
            </div>

            {/* Country Dropdown */}
            <div className="form-group">
              <div className="dropdown-wrapper">
                <CountryDropdown
                  value={formData.country}
                  onChange={handleCountryChange}
                  className={`form-control ${formData.country ? "has-value" : ""}`}
                />
                <label className={formData.country ? "floating" : ""}>Country *</label>
              </div>
            </div>

            {/* Region Dropdown */}
            <div className="form-group">
              <div className="dropdown-wrapper">
                <RegionDropdown
                  country={formData.country}
                  value={formData.region}
                  onChange={handleRegionChange}
                  className={`form-control ${formData.region ? "has-value" : ""}`}
                  disabled={!formData.country}
                />
                <label className={formData.region ? "floating" : ""}>Region / State *</label>
              </div>
            </div>

            {/* Enquiry Type */}
            <div className="form-group">
              <select
                name="enquiry_type"
                value={formData.enquiry_type}
                onChange={handleChange}
                className={errors.enquiry_type ? "input-error" : ""}
              >
                {enquiryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || "Select enquiry type"}
                  </option>
                ))}
              </select>
              <label className={formData.enquiry_type ? "floating" : ""}>Enquiry Type *</label>
              {errors.enquiry_type && <small className="error">{errors.enquiry_type}</small>}
            </div>

            {/* Service Type (conditional) */}
            {formData.enquiry_type === "Services" && (
              <div className="form-group">
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className={errors.service_type ? "input-error" : ""}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt || "Select service type"}
                    </option>
                  ))}
                </select>
                <label className={formData.service_type ? "floating" : ""}>Service Type *</label>
                {errors.service_type && <small className="error">{errors.service_type}</small>}
              </div>
            )}

            {/* Event Date */}
            <div className="form-group">
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className={errors.event_date ? "input-error" : ""}
              />
              <label className={formData.event_date ? "floating" : ""}>Event Date (optional)</label>
              {errors.event_date && <small className="error">{errors.event_date}</small>}
            </div>

            {/* Message */}
            <div className="form-group full-width">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder=" "
                rows={4}
              />
              <label>Message</label>
            </div>

            {statusMessage && (
              <div className={`toast-notification ${statusMessage.includes("✅") ? "success" : "error"}`}>
                {statusMessage}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        </section>

        <aside className="contact-info-section">
          <div className="info-block">
            <h3>Co-Founder</h3>
            <p><strong>Name:</strong> {contactInfo.coFounder.name}</p>
            <p><strong>Email:</strong> {contactInfo.coFounder.email}</p>
            <p><strong>Phone:</strong> {contactInfo.coFounder.phone}</p>
            <p><strong>WhatsApp:</strong> {contactInfo.coFounder.whatsapp}</p>
          </div>

          <div className="info-block">
            <h3>Headquarters</h3>
            {contactInfo.headquarters.map((line, i) => <p key={i}>{line}</p>)}
          </div>

          <div className="social-hub-embed">
            <h3>Connect With Us</h3>
            <SocialHub />
          </div>
        </aside>
      </main>

      <section className="map-section">
        <h4>Our Location</h4>
        <iframe
          title="Ethical Multimedia GH Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.428661923482!2d-0.5330301294382339!3d5.503194382269809!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzAnMTEuNSJOIDDCsDMyJzAwLjkiVw!5e0!3m2!1sen!2sgh!4v1693952745678!5m2!1sen!2sgh"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
};

export default ContactForm;
