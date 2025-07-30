import { useState, useRef } from 'react';
import publicAxios from '../../api/publicAxios';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './newsletter.css';

// ✅ Use the correct env variable name
const SITE_KEY = process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY;

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const recaptchaRef = useRef(null);

  const resetForm = () => {
    setEmail('');
    setName('');
    recaptchaRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      toast.error('❌ Please complete the reCAPTCHA.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warn('⚠️ A valid email is required.');
      setInputError(true);
      setTimeout(() => setInputError(false), 3000);
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await publicAxios.post('/newsletter/subscribe/', {
        email: email.trim(),
        name: name.trim(),
        token: captchaToken,
      });

      toast.success(data?.message || '✅ Please check your email to confirm your subscription.');
      resetForm();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        '❌ Subscription failed. Please try again later.';
      toast.error(errorMsg);
      setInputError(true);
      setTimeout(() => setInputError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="newsletter-form"
      aria-label="Newsletter Signup Form"
      noValidate
    >
      <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>

      <input
        type="text"
        name="name"
        placeholder="Your Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="newsletter-input"
        aria-label="Name"
        autoComplete="name"
      />

      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={`newsletter-input ${inputError ? 'error' : ''}`}
        aria-invalid={inputError}
        aria-label="Email address"
        autoComplete="email"
      />

      <ReCAPTCHA
        sitekey={SITE_KEY}
        ref={recaptchaRef}
        className="newsletter-recaptcha"
      />

      <button
        type="submit"
        className="newsletter-button"
        disabled={submitting || !email.trim()}
        aria-busy={submitting}
        aria-label="Submit newsletter subscription"
      >
        {submitting ? 'Submitting…' : 'Subscribe'}
      </button>

      {showSuccess && (
        <div className="newsletter-success" role="alert" aria-live="polite">
          ✅ Subscription request sent. Check your email to confirm.
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
