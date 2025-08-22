import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import NewsLetterSignup from '../user/NewsLetterSignup'; // ✅ path to your newsletter component

function Footer() {
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
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/unsubscribe">Unsubscribe</Link></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:info@eethmghmultimedia.com">info@eethmghmultimedia.com</a></p>
          <p>WhatsApp: <a href="https://wa.me/233552988735" target="_blank" rel="noopener noreferrer">+233 55 298 8735</a></p>
          <p>Phone: <a href="tel:+233553424865">+233 55 342 4865</a></p>
        </div>

        {/* Newsletter Signup */}
        <div className="footer-section newsletter">
          <NewsLetterSignup /> {/* ✅ call your newsletter component here */}
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
