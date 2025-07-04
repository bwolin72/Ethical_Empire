import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import axiosCommon from '../../api/axiosCommon';
import './Footer.css';

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function Footer() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter an email address.');
    if (!captchaToken) return toast.error('Please complete the reCAPTCHA.');

    setLoading(true);
    try {
      await axiosCommon.post('newsletter/subscribe/', {
        email,
        token: captchaToken,
      });
      toast.success('✅ Please check your email to confirm your subscription.');
      setEmail('');
      setCaptchaToken('');
    } catch (error) {
      toast.error(
        error.response?.data?.error || '❌ Subscription failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:asaasebandeethm@gmail.com">asaasebandeethm@gmail.com</a></p>
          <p>WhatsApp: <a href="https://wa.me/233552988735" target="_blank" rel="noopener noreferrer">+233 55 298 8735</a></p>
          <p>Phone: <a href="tel:+233553424865">+233 55 342 4865</a></p>
        </div>

        {/* Newsletter */}
        <div className="footer-section newsletter">
          <h4>Subscribe to Our Newsletter</h4>
          <form onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />

            <div className="recaptcha-wrapper">
              <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>

            <button
              type="submit"
              className="newsletter-button"
              disabled={loading}
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="unsubscribe-text">
            Want out? <Link to="/unsubscribe">Unsubscribe</Link>.
          </p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ethical Empire. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
