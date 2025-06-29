// src/components/newsletter/NewsletterSignup.jsx
import { useState, useRef } from 'react';
import publicAxios from '../../api/publicAxios';
import ReCAPTCHA from 'react-google-recaptcha';
import './newsletter.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SITE_KEY = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      toast.error('❌ Please complete the reCAPTCHA.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await publicAxios.post('/user-account/newsletter/subscribe/', {
        email,
        name,
        token: captchaToken,
      });

      toast.success('✅ Please check your email to confirm your subscription.');
      setEmail('');
      setName('');
      setShowSuccess(true);
      recaptchaRef.current.reset();

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err?.response?.data?.error || '❌ Subscription failed. Please try again.';
      toast.error(errorMsg);
      setInputError(true);
      setTimeout(() => setInputError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="newsletter-form" aria-label="Newsletter Signup Form">
      <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>

      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="newsletter-input"
        aria-label="Name"
      />

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`newsletter-input ${inputError ? 'error' : ''}`}
        aria-invalid={inputError}
        aria-label="Email address"
      />

      <ReCAPTCHA
        sitekey={SITE_KEY}
        ref={recaptchaRef}
        className="newsletter-recaptcha"
      />

      <button
        type="submit"
        className="newsletter-button"
        disabled={submitting || !email}
        aria-busy={submitting}
        aria-label="Submit newsletter subscription"
      >
        {submitting ? 'Submitting…' : 'Subscribe'}
      </button>

      {showSuccess && (
        <div className="newsletter-success" role="alert" aria-live="polite">
          ✅ Subscription confirmed. Check your email!
        </div>
      )}

      <p className="newsletter-terms">
        By subscribing, you agree to our{' '}
        <a href="/privacy-policy" className="newsletter-link">
          Privacy Policy
        </a>.
      </p>
    </form>
  );
}
