import React, { useState } from "react";
import "./Legal.css";

const COMPANY = "Ethical Multimedia";
const CONTACT_EMAIL = "info@eethmghmultimedia.com";
const VERSION = "v1.0";
const LAST_UPDATED = "August 21, 2025";

const ServicesList = () => (
  <ul className="legal-list">
    <li>Catering — authentic Ghanaian & gourmet menus</li>
    <li>DJ — professional DJs for every vibe</li>
    <li>Event Planning — concept to completion</li>
    <li>Lighting — dynamic venue lighting</li>
    <li>Live Band — highlife to contemporary hits</li>
    <li>MC/Host — charismatic hosts & event flow</li>
    <li>Photography — event & portrait photography</li>
    <li>Sound Setup — professional audio systems</li>
    <li>Videography — event video capture & editing</li>
  </ul>
);

export default function Terms() {
  const [accepted, setAccepted] = useState(
    !!localStorage.getItem("termsAccepted")
  );

  function handleAccept() {
    const payload = {
      version: VERSION,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem("termsAccepted", JSON.stringify(payload));
    setAccepted(true);
  }

  return (
    <div className="legal-page">
      <header>
        <h1>{COMPANY} — Terms & Conditions</h1>
        <p className="legal-meta">
          Version: {VERSION} • Last updated: {LAST_UPDATED}
        </p>
        <p>
          Welcome — these Terms & Conditions (the "Terms") govern your use of
          services provided by {COMPANY} (we, us, our). By using our site or
          booking services, you agree to these Terms.
        </p>
      </header>

      <nav aria-label="Table of contents">
        <h2>Contents</h2>
        <ol>
          <li><a href="#services">1. Our Services</a></li>
          <li><a href="#bookings-payments">2. Bookings & Payments</a></li>
          <li><a href="#cancellations-refunds">3. Cancellations & Refunds</a></li>
          <li><a href="#user-responsibilities">4. User Responsibilities</a></li>
          <li><a href="#intellectual-property">5. Intellectual Property</a></li>
          <li><a href="#liability">6. Limitation of Liability</a></li>
          <li><a href="#privacy">7. Privacy & Data</a></li>
          <li><a href="#jurisdiction">8. Governing Law & Jurisdiction</a></li>
          <li><a href="#changes">9. Changes to Terms</a></li>
          <li><a href="#contact">10. Contact</a></li>
        </ol>
      </nav>

      <section id="services">
        <h2>1. Our Services</h2>
        <p>
          {COMPANY} provides event-related services including (but not limited
          to) the following:
        </p>
        <ServicesList />
        <p>
          We operate locally (Ghana — Central Region) and internationally. Each
          service may have its own additional terms or service-level agreement
          communicated at booking.
        </p>
      </section>

      <section id="bookings-payments">
        <h2>2. Bookings & Payments</h2>
        <p>
          Bookings are confirmed only once any required deposit or full payment
          is received and confirmed by us. Prices, deposits, payment schedules
          and accepted payment methods will be shown at booking or in a quote.
        </p>
        <ul className="legal-list">
          <li>Clients must provide accurate information (date, venue, guest counts).</li>
          <li>Taxes, travel, or venue-related fees may be charged in addition to service fees.</li>
          <li>Invoices are generated and emailed — clients are responsible for ensuring contact details are correct.</li>
        </ul>
      </section>

      <section id="cancellations-refunds">
        <h2>3. Cancellations & Refunds</h2>
        <p>
          Cancellation/refund policies vary by service. Unless otherwise stated:
        </p>
        <ul className="legal-list">
          <li>Deposits are typically non-refundable within X days of event (see your booking confirmation).</li>
          <li>Refunds (where applicable) will follow our refund processing timelines shown on the invoice.</li>
          <li>We may reschedule services due to force majeure (see Liability).</li>
        </ul>
      </section>

      <section id="user-responsibilities">
        <h2>4. User Responsibilities</h2>
        <p>
          As a client you agree to:
        </p>
        <ul className="legal-list">
          <li>Provide accurate booking details and required permissions for venues.</li>
          <li>Comply with local laws at event locations.</li>
          <li>Not use our services for illegal or harmful activities.</li>
        </ul>
      </section>

      <section id="intellectual-property">
        <h2>5. Intellectual Property</h2>
        <p>
          All content, branding, images, audio, videos and website content owned
          by {COMPANY} are protected by copyright and other IP laws. Clients
          shall not reproduce or use our marks without prior written consent.
        </p>
        <p>
          For photography/videography services, usage rights and delivery scope
          are defined in your invoice/contract.
        </p>
      </section>

      <section id="liability">
        <h2>6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {COMPANY} shall not be liable
          for indirect, incidental, special or consequential damages. Our
          aggregate liability for a claim is limited to the amount paid by the
          client for the affected service.
        </p>
        <p>
          We are not responsible for circumstances outside our control — including but not limited to venue restrictions, vendor failure, weather events, or government restrictions.
        </p>
      </section>

      <section id="privacy">
        <h2>7. Privacy & Data</h2>
        <p>
          Our Privacy Policy describes how we collect and use personal information — please read it carefully. By accepting these Terms you also acknowledge our Privacy Policy.
        </p>
        <p><a href="/privacy" className="underline">Read our full Privacy Policy</a></p>
      </section>

      <section id="jurisdiction">
        <h2>8. Governing Law & Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of Ghana. Where we operate internationally, local laws may also apply. Any disputes arising shall be subject to the exclusive jurisdiction of Ghanaian courts unless otherwise agreed in writing.
        </p>
      </section>

      <section id="changes">
        <h2>9. Changes to Terms</h2>
        <p>
          We may change these Terms from time to time. Changes will be posted with an updated "Last updated" date. Continued use of services after changes constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section id="contact">
        <h2>10. Contact</h2>
        <p>
          For questions about these Terms, contact:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>

      <footer>
        {!accepted ? (
          <button className="btn-accept" onClick={handleAccept}>
            I have read and accept these Terms
          </button>
        ) : (
          <p className="accepted-msg">You have accepted these Terms.</p>
        )}
      </footer>
    </div>
  );
}
