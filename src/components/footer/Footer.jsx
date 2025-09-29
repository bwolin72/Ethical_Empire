import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NewsLetterSignup from "../user/NewsLetterSignup";
import "./Footer.css";

function Footer() {
  const quickLinks = [
    { to: "/about", label: "About Us" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
    { to: "/unsubscribe", label: "Unsubscribe" },
    { to: "/faq", label: "FAQ" },
    { to: "/blog", label: "Blog" },
    { to: "/blog/articles", label: "Articles" },
    { to: "/blog/latest", label: "Latest" },
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
            {/* Social Hub as a link instead of inline display */}
            <li>
              <Link to="/social">
                Social Hub <ArrowRight size={14} />
              </Link>
            </li>
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

        {/* Newsletter Signup */}
        <div className="footer-section newsletter">
          <h4>Stay Updated</h4>
          <NewsLetterSignup />
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ethical Empire. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
