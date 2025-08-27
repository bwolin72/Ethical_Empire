import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import newsletterService from "../../api/services/newsletterService";
import "react-toastify/dist/ReactToastify.css";
import "./newsletter.css";

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_PUBLIC_KEY;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const recaptchaRef = useRef(null);

  const resetForm = () => {
    setEmail("");
    setName("");
    recaptchaRef.current?.reset();
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const captchaToken = recaptchaRef.current?.getValue();

    if (!captchaToken) {
      toast.error("❌ Please complete the reCAPTCHA.");
      return;
    }

    if (!validateEmail(email)) {
      toast.warn("⚠️ A valid email is required.");
      setInputError(true);
      setTimeout(() => setInputError(false), 3000);
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await newsletterService.subscribe({
        email: email.trim(),
        name: name.trim(),
        token: captchaToken,
      });

      toast.success(
        data?.message ||
          "✅ Please check your email to confirm your subscription."
      );
      resetForm();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 6000);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error ||
        "❌ Subscription failed. Please try again later.";

      if (errorMsg.toLowerCase().includes("already")) {
        toast.info(
          "📬 You are already subscribed or confirmation is pending."
        );
      } else {
        toast.error(errorMsg);
      }

      setInputError(true);
      setTimeout(() => setInputError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (!SITE_KEY) {
    console.warn("Missing reCAPTCHA site key");
    return <p>⚠️ Cannot load subscription form. Please try again later.</p>;
  }

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
        onBlur={() => {
          if (email && !validateEmail(email)) {
            setInputError(true);
            toast.warn("⚠️ Invalid email format");
          }
        }}
        required
        className={`newsletter-input ${inputError ? "error" : ""}`}
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
        {submitting ? <span className="spinner" /> : "Subscribe"}
      </button>

      {showSuccess && (
        <div className="newsletter-success" role="alert" aria-live="polite">
          ✅ Subscription request sent. Check your email to confirm.
        </div>
      )}

      <label className="terms-checkbox">
        <input type="checkbox" required />
        <span>
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </span>
      </label>
    </form>
  );
}
