import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import NewsLetterSignup from "../user/NewsLetterSignup";
import "./Footer.css";

function Footer() {
  const quickLinks = [
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
    { to: "/unsubscribe", label: "Unsubscribe" },
    { to: "/faq", label: "FAQ" }, // ✅ Added FAQ link
  ];

  const legalLinks = [
    { to: "/terms", label: "Terms & Conditions" },
    { to: "/privacy", label: "Privacy Policy" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Company Info */}
        <div className="footer-section">
          <h3>Ethical Empire</h3>
          <p>Premier entertainment and event services.</p>
          <p className="slogan">Experience the Ethical Multimedia difference.</p>
        </div>

        {/* Quick Links */}
        <nav className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>
                  {link.label} <ArrowRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal Links */}
        <nav className="footer-section">
          <h4>Legal</h4>
          <ul>
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Info */}
        <address className="footer-section">
          <h4>Contact Us</h4>
          <p>
            <Mail size={16} />{" "}
            <a href="mailto:info@eethmghmultimedia.com">
              info@eethmghmultimedia.com
            </a>
          </p>
          <p>
            <MessageCircle size={16} />{" "}
            <a
              href="https://wa.me/233552988735"
              target="_blank"
              rel="noopener noreferrer"
            >
              +233 55 298 8735
            </a>
          </p>
          <p>
            <Phone size={16} /> <a href="tel:+233553424865">+233 55 342 4865</a>
          </p>
        </address>

        {/* Newsletter Signup */}
        <div className="footer-section newsletter">
          <NewsLetterSignup />
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Ethical Empire. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
