import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import NewsLetterSignup from "../user/NewsLetterSignup";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/about", label: "About Us", icon: "👥" },
    { to: "/services", label: "All Services", icon: "🎯" },
    { to: "/bookings", label: "Book Now", icon: "📅" },
    { to: "/contact", label: "Contact", icon: "📞" },
    { to: "/flipbook", label: "Our Profile", icon: "📖" },
    { to: "/faq", label: "FAQ", icon: "❓" },
    { to: "/blog", label: "Blog", icon: "📝" },
  ];

  const serviceLinks = [
    { to: "/services/live-band", label: "Live Band", icon: "🎵" },
    { to: "/services/catering", label: "Catering", icon: "🍽️" },
    { to: "/services/decor", label: "Decor & Styling", icon: "🎨" },
    { to: "/services/media-hosting", label: "Media Hosting", icon: "🎥" },
    { to: "/services/general", label: "General Services", icon: "✨" },
  ];

  const legalLinks = [
    { to: "/terms", label: "Terms & Conditions" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/unsubscribe", label: "Unsubscribe" },
  ];

  const contactInfo = [
    { icon: <Phone size={16} />, text: "+233 24 123 4567", link: "tel:+233241234567" },
    { icon: <Mail size={16} />, text: "info@eethmgh.com", link: "mailto:info@eethmgh.com" },
    { icon: <MapPin size={16} />, text: "Accra, Ghana", link: "https://maps.google.com/?q=Accra+Ghana" },
    { icon: <Clock size={16} />, text: "Mon - Sat: 8AM - 8PM", link: null },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          {/* Company Info */}
          <div className="footer-section company-info">
            <div className="footer-logo">
              <h3 className="company-name">EETHM_GH Multimedia</h3>
              <p className="company-tagline">Professional Event & Entertainment Services</p>
            </div>
            <p className="company-description">
              We deliver exceptional multimedia, catering, decor, and live entertainment 
              experiences across Ghana and West Africa.
            </p>
            <div className="contact-info">
              {contactInfo.map((item, index) => (
                item.link ? (
                  <a 
                    key={index} 
                    href={item.link} 
                    className="contact-item"
                    target={item.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                  >
                    <span className="contact-icon">{item.icon}</span>
                    <span>{item.text}</span>
                  </a>
                ) : (
                  <div key={index} className="contact-item">
                    <span className="contact-icon">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav className="footer-section quick-links">
            <h4 className="footer-title">
              <span className="title-icon">⚡</span> Quick Links
            </h4>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    <span className="link-icon">{link.icon}</span>
                    {link.label} <ArrowRight size={12} className="link-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav className="footer-section services">
            <h4 className="footer-title">
              <span className="title-icon">🎯</span> Our Services
            </h4>
            <ul>
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    <span className="link-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="footer-section newsletter">
            <h4 className="footer-title">
              <span className="title-icon">📬</span> Stay Updated
            </h4>
            <p className="newsletter-description">
              Subscribe to our newsletter for exclusive offers and event tips.
            </p>
            <NewsLetterSignup />
          </div>
        </div>
      </div>

      <div className="footer-middle">
        <div className="footer-container">
          {/* Social Media */}
          <div className="social-section">
            <h5>Connect With Us</h5>
            <div className="social-links">
              <a href="https://facebook.com/eethmgh" className="social-link" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">📘</span> Facebook
              </a>
              <a href="https://instagram.com/eethmgh" className="social-link" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">📸</span> Instagram
              </a>
              <a href="https://twitter.com/eethmgh" className="social-link" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">🐦</span> Twitter
              </a>
              <a href="https://youtube.com/eethmgh" className="social-link" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">🎥</span> YouTube
              </a>
              <a href="https://tiktok.com/@eethmgh" className="social-link" target="_blank" rel="noopener noreferrer">
                <span className="social-icon">🎵</span> TikTok
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          {/* Legal Links */}
          <div className="legal-links">
            {legalLinks.map((link) => (
              <Link key={link.to} to={link.to} className="legal-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div className="copyright">
            <p>&copy; {currentYear} EETHM_GH Multimedia. All rights reserved.</p>
            <p className="brand-slogan">
              <span className="slogan-icon">✨</span> Experience the Ethical Multimedia difference.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
