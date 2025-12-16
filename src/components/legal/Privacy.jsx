import React, { useState } from "react";
import "./Legal.css"; 

const COMPANY = "Ethical Multimedia";
const CONTACT_EMAIL = "info@eethmghmultimedia.com";
const VERSION = "v1.0";
const LAST_UPDATED = "August 21, 2025";

export default function Privacy() {
  const [consentGiven, setConsentGiven] = useState(
    !!localStorage.getItem("privacyConsent")
  );

  function giveConsent() {
    const payload = {
      version: VERSION,
      consentAt: new Date().toISOString(),
      purpose: "general site usage, bookings, marketing (optional)",
    };
    localStorage.setItem("privacyConsent", JSON.stringify(payload));
    setConsentGiven(true);
  }

  return (
    <div className="legal-page">
      <header>
        <h1>{COMPANY} — Privacy Policy</h1>
        <p className="legal-meta">
          Version: {VERSION} • Last updated: {LAST_UPDATED}
        </p>
        <p>
          {COMPANY} ("we", "our", "us") respects your privacy. This policy
          explains how we collect, use, disclose and protect personal
          information when you use our website or services.
        </p>
      </header>

      <nav aria-label="Table of contents">
        <h2>Contents</h2>
        <ol>
          <li><a href="#data-we-collect">1. Data We Collect</a></li>
          <li><a href="#how-we-use">2. How We Use Your Data</a></li>
          <li><a href="#legal-basis">3. Legal Basis & Consent</a></li>
          <li><a href="#sharing">4. Sharing & Third Parties</a></li>
          <li><a href="#security">5. Security</a></li>
          <li><a href="#retention">6. Data Retention</a></li>
          <li><a href="#rights">7. Your Rights</a></li>
          <li><a href="#cookies">8. Cookies & Tracking</a></li>
          <li><a href="#international">9. International Transfers</a></li>
          <li><a href="#contact">10. Contact</a></li>
        </ol>
      </nav>

      <section id="data-we-collect">
        <h2>1. Data We Collect</h2>
        <p>We may collect:</p>
        <ul className="legal-list">
          <li>Contact details (name, email, phone)</li>
          <li>Booking details (event date, guest counts, venue)</li>
          <li>Payment & invoice data (via third-party processors)</li>
          <li>Media you provide (photos, videos) when using photography/videography services</li>
          <li>Usage data (pages visited, cookies, IP address, device info)</li>
        </ul>
      </section>

      <section id="how-we-use">
        <h2>2. How We Use Your Data</h2>
        <ul className="legal-list">
          <li>To provide and manage bookings, invoices and event services</li>
          <li>To communicate (confirmation emails, updates, marketing where consented)</li>
          <li>To improve the website and services (analytics)</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section id="legal-basis">
        <h2>3. Legal Basis & Consent</h2>
        <p>
          For users in regions with data protection laws (e.g., GDPR), we rely
          on consent, contract performance, and legitimate interests (e.g.,
          site security, analytics). Where consent is required, we obtain
          clear consent and provide a way to withdraw it.
        </p>
      </section>

      <section id="sharing">
        <h2>4. Sharing & Third Parties</h2>
        <p>
          We may share personal data with:
        </p>
        <ul className="legal-list">
          <li>Payment processors (for charges)</li>
          <li>Cloud storage & hosting providers</li>
          <li>Vendors engaged to deliver event services (e.g., caterers, venues)</li>
          <li>Analytics providers</li>
        </ul>
        <p>
          We require third parties to protect personal data and use it only for
          contracted purposes.
        </p>
      </section>

      <section id="security">
        <h2>5. Security</h2>
        <p>
          We implement reasonable technical and organizational measures to
          protect personal data (encryption, access controls). No internet
          transmission is 100% secure — we cannot guarantee absolute security.
        </p>
      </section>

      <section id="retention">
        <h2>6. Data Retention</h2>
        <p>
          We retain personal data as long as necessary to fulfil service
          purposes, meet legal obligations, resolve disputes, and enforce our
          agreements.
        </p>
      </section>

      <section id="rights">
        <h2>7. Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights including to:
        </p>
        <ul className="legal-list">
          <li>Request access to your data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent and opt-out of marketing</li>
          <li>Request restriction or portability</li>
        </ul>
        <p>
          To exercise rights, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section id="cookies">
        <h2>8. Cookies & Tracking</h2>
        <p>
          We use cookies and similar technologies for essential site functions
          and analytics. You can control cookies via your browser settings.
        </p>
      </section>

      <section id="international">
        <h2>9. International Transfers</h2>
        <p>
          As we operate both locally and internationally, personal data may be
          transferred across borders. We take steps to ensure appropriate
          safeguards are in place.
        </p>
      </section>

      <section id="contact">
        <h2>10. Contact</h2>
        <p>
          For privacy questions, requests or complaints, contact:
          <br />
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>

      <footer>
        <p className="legal-meta">
          Country of origin: Ghana • Region of origin: Central • Operation: Local & International.
        </p>
        {!consentGiven ? (
          <button className="btn-consent" onClick={giveConsent}>
            I consent to collection & use as described
          </button>
        ) : (
          <p className="accepted-msg">You have given consent.</p>
        )}
      </footer>
    </div>
  );
}
