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
    phone: "+233553424865",
    whatsapp: "+233559241828",
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
        setStatusMessage("✅ Message sent successfully! We’ll be in touch.");
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

  // Input Component
  const InputField = ({ name, type = "text" }) => (
    <div className="form-group">
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder=" "
        aria-invalid={!!errors[name]}
      />
      <label>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
      {errors[name] && <small className="error">{errors[name]}</small>}
    </div>
  );

  const SelectField = ({ name, options, label }) => (
    <div className="form-group">
      <select name={name} value={formData[name]} onChange={handleChange}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || `Select ${label.toLowerCase()}`}
          </option>
        ))}
      </select>
      <label>{label}</label>
      {errors[name] && <small className="error">{errors[name]}</small>}
    </div>
  );

  return (
    <div className="contact-page animate-fade-in-up">
      <header className="form-header">
        <img src={logo} alt="EETHM Logo" className="logo" />
        <h2>Let’s Create Something Memorable</h2>
        <p className="slogan">Reach out to book our services or request more information</p>
      </header>

      <main className="contact-layout">
        <section className="contact-form-section">
          <form onSubmit={handleSubmit} noValidate>
            {["name", "email", "phone"].map((f) => (
              <InputField key={f} name={f} type={f === "email" ? "email" : "text"} />
            ))}

            <div className="form-group">
              <CountryDropdown
                value={formData.country}
                onChange={(val) => setFormData((p) => ({ ...p, country: val, region: "" }))}
                className="form-control"
              />
              <label>Country</label>
            </div>

            <div className="form-group">
              <RegionDropdown
                country={formData.country}
                value={formData.region}
                onChange={(val) => setFormData((p) => ({ ...p, region: val }))}
                className="form-control"
              />
              <label>Region / State</label>
            </div>

            <SelectField name="enquiry_type" options={enquiryOptions} label="Enquiry Type *" />
            {formData.enquiry_type === "Services" && (
              <SelectField name="service_type" options={serviceOptions} label="Service Type" />
            )}

            <div className="form-group">
              <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} />
              <label>Event Date (optional)</label>
              {errors.event_date && <small className="error">{errors.event_date}</small>}
            </div>

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

            {statusMessage && <div className="toast-notification">{statusMessage}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Sending…" : "Submit"}
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
