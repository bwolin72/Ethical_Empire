import React, { useState, useEffect } from "react";
import "./Legal.css"; // Reuse the same Legal.css

const COMPANY = "Ethical Multimedia";
const CONTACT_EMAIL = "info@eethmghmultimedia.com";
const VERSION = "v1.0";
const LAST_UPDATED = "December 17, 2024";

const cookieTypes = [
  {
    category: "Essential Cookies",
    description: "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.",
    examples: [
      {
        name: "session_id",
        purpose: "Maintains user session state across page requests",
        duration: "Session",
        provider: COMPANY
      },
      {
        name: "csrf_token",
        purpose: "Protects against cross-site request forgery attacks",
        duration: "Session",
        provider: COMPANY
      },
      {
        name: "auth_token",
        purpose: "Remembers login state for authenticated users",
        duration: "30 days",
        provider: COMPANY
      }
    ]
  },
  {
    category: "Performance & Analytics Cookies",
    description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.",
    examples: [
      {
        name: "_ga",
        purpose: "Google Analytics - Distinguishes unique users",
        duration: "2 years",
        provider: "Google"
      },
      {
        name: "_gid",
        purpose: "Google Analytics - Distinguishes unique users",
        duration: "24 hours",
        provider: "Google"
      },
      {
        name: "_gat",
        purpose: "Google Analytics - Throttles request rate",
        duration: "1 minute",
        provider: "Google"
      }
    ]
  },
  {
    category: "Functional Cookies",
    description: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.",
    examples: [
      {
        name: "theme_preference",
        purpose: "Remembers user's light/dark mode preference",
        duration: "1 year",
        provider: COMPANY
      },
      {
        name: "language",
        purpose: "Remembers user's language preference",
        duration: "1 year",
        provider: COMPANY
      },
      {
        name: "location_preference",
        purpose: "Remembers user's region/country preference",
        duration: "30 days",
        provider: COMPANY
      }
    ]
  },
  {
    category: "Marketing Cookies",
    description: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.",
    examples: [
      {
        name: "_fbp",
        purpose: "Facebook Pixel - Connects social media activity",
        duration: "3 months",
        provider: "Meta"
      },
      {
        name: "NID",
        purpose: "Google Ads - Personalizes ads based on interests",
        duration: "6 months",
        provider: "Google"
      },
      {
        name: "IDE",
        purpose: "Google DoubleClick - Delivers targeted ads",
        duration: "1 year",
        provider: "Google"
      }
    ]
  }
];

export default function CookiesPolicy() {
  const [analyticsAccepted, setAnalyticsAccepted] = useState(
    localStorage.getItem("analyticsConsent") === "true"
  );
  const [marketingAccepted, setMarketingAccepted] = useState(
    localStorage.getItem("marketingConsent") === "true"
  );
  const [showCookieBanner, setShowCookieBanner] = useState(
    !localStorage.getItem("cookiePreferencesSet")
  );

  useEffect(() => {
    // Initialize Google Analytics based on consent
    if (analyticsAccepted) {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA ID
    }
  }, [analyticsAccepted]);

  const handleAcceptAll = () => {
    localStorage.setItem("analyticsConsent", "true");
    localStorage.setItem("marketingConsent", "true");
    localStorage.setItem("cookiePreferencesSet", "true");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setAnalyticsAccepted(true);
    setMarketingAccepted(true);
    setShowCookieBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("analyticsConsent", "false");
    localStorage.setItem("marketingConsent", "false");
    localStorage.setItem("cookiePreferencesSet", "true");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setAnalyticsAccepted(false);
    setMarketingAccepted(false);
    setShowCookieBanner(false);
  };

  const handleCustomSettings = () => {
    localStorage.setItem("analyticsConsent", analyticsAccepted.toString());
    localStorage.setItem("marketingConsent", marketingAccepted.toString());
    localStorage.setItem("cookiePreferencesSet", "true");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowCookieBanner(false);
  };

  const handleResetPreferences = () => {
    localStorage.removeItem("analyticsConsent");
    localStorage.removeItem("marketingConsent");
    localStorage.removeItem("cookiePreferencesSet");
    localStorage.removeItem("cookieConsentDate");
    setAnalyticsAccepted(false);
    setMarketingAccepted(false);
    setShowCookieBanner(true);
  };

  const renderCookieTable = () => (
    <div className="cookie-table-container">
      <table className="cookie-table">
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Provider</th>
          </tr>
        </thead>
        <tbody>
          {cookieTypes.flatMap(type => 
            type.examples.map((cookie, index) => (
              <tr key={`${type.category}-${index}`}>
                <td><code>{cookie.name}</code></td>
                <td>{cookie.purpose}</td>
                <td>{cookie.duration}</td>
                <td>{cookie.provider}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="cookie-banner">
          <div className="cookie-banner-content">
            <h3>🍪 Cookie Consent</h3>
            <p>
              We use cookies to enhance your browsing experience, analyze site traffic, 
              and personalize content. By clicking "Accept All", you consent to our use 
              of all cookies. You can manage your preferences or learn more in our 
              <a href="/cookies" className="underline"> Cookies Policy</a>.
            </p>
            <div className="cookie-banner-actions">
              <button onClick={handleAcceptEssential} className="btn-cookie-essential">
                Essential Only
              </button>
              <button onClick={handleAcceptAll} className="btn-cookie-accept">
                Accept All
              </button>
              <button onClick={() => setShowCookieBanner(false)} className="btn-cookie-custom">
                Customize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Cookie Settings Modal */}
      {showCookieBanner && (
        <div className="cookie-settings-modal">
          <div className="cookie-settings-content">
            <h3>Cookie Preferences</h3>
            <div className="cookie-settings-group">
              <div className="cookie-setting">
                <div className="cookie-setting-header">
                  <h4>Essential Cookies</h4>
                  <span className="cookie-badge required">Always Active</span>
                </div>
                <p>Required for the website to function properly. Cannot be disabled.</p>
              </div>
              
              <div className="cookie-setting">
                <div className="cookie-setting-header">
                  <h4>Analytics Cookies</h4>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={analyticsAccepted}
                      onChange={(e) => setAnalyticsAccepted(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              
              <div className="cookie-setting">
                <div className="cookie-setting-header">
                  <h4>Marketing Cookies</h4>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={marketingAccepted}
                      onChange={(e) => setMarketingAccepted(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Used to deliver personalized advertisements.</p>
              </div>
            </div>
            
            <div className="cookie-settings-actions">
              <button onClick={handleCustomSettings} className="btn-cookie-save">
                Save Preferences
              </button>
              <button onClick={handleAcceptAll} className="btn-cookie-accept-all">
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Cookies Policy Page */}
      <div className="legal-page">
        <header>
          <h1>{COMPANY} — Cookies Policy</h1>
          <p className="legal-meta">
            Version: {VERSION} • Last updated: {LAST_UPDATED}
          </p>
          <p>
            This Cookies Policy explains how {COMPANY} ("we", "us", "our") uses 
            cookies and similar technologies on our website. By using our site, 
            you consent to our use of cookies in accordance with this policy.
          </p>
        </header>

        <nav aria-label="Table of contents">
          <h2>Contents</h2>
          <ol>
            <li><a href="#what-are-cookies">1. What Are Cookies?</a></li>
            <li><a href="#types-we-use">2. Types of Cookies We Use</a></li>
            <li><a href="#cookie-list">3. Cookie List</a></li>
            <li><a href="#third-party">4. Third-Party Cookies</a></li>
            <li><a href="#manage-cookies">5. How to Manage Cookies</a></li>
            <li><a href="#updates">6. Updates to This Policy</a></li>
            <li><a href="#contact">7. Contact Us</a></li>
          </ol>
        </nav>

        <section id="what-are-cookies">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer, 
            smartphone, or other device when you visit our website. They help 
            us provide you with a better experience by:
          </p>
          <ul className="legal-list">
            <li>Remembering your preferences and settings</li>
            <li>Understanding how you use our website</li>
            <li>Improving our services based on usage patterns</li>
            <li>Delivering relevant content and advertisements</li>
          </ul>
        </section>

        <section id="types-we-use">
          <h2>2. Types of Cookies We Use</h2>
          {cookieTypes.map((type, index) => (
            <div key={index} className="cookie-type-section">
              <h3>{type.category}</h3>
              <p>{type.description}</p>
            </div>
          ))}
        </section>

        <section id="cookie-list">
          <h2>3. Cookie List</h2>
          <p>
            Below is a list of the main cookies we use on our website:
          </p>
          {renderCookieTable()}
          <p className="legal-note">
            <strong>Note:</strong> This list is not exhaustive and may be updated 
            as we add or change services. Third-party services may also set their 
            own cookies.
          </p>
        </section>

        <section id="third-party">
          <h2>4. Third-Party Cookies</h2>
          <p>
            We work with third-party services that may set cookies on your device 
            when you visit our website. These include:
          </p>
          <ul className="legal-list">
            <li>
              <strong>Google Analytics:</strong> For website analytics and performance measurement
            </li>
            <li>
              <strong>Google Ads:</strong> For advertising and remarketing purposes
            </li>
            <li>
              <strong>Facebook/Meta:</strong> For social media integration and advertising
            </li>
            <li>
              <strong>Payment Processors:</strong> For secure payment processing
            </li>
          </ul>
          <p>
            These third parties have their own privacy policies. We recommend 
            reviewing their policies to understand how they use your information.
          </p>
        </section>

        <section id="manage-cookies">
          <h2>5. How to Manage Cookies</h2>
          <div className="manage-options">
            <div className="manage-option">
              <h3>Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their 
                settings. You can usually find these settings in the "Options" 
                or "Preferences" menu of your browser. Common options include:
              </p>
              <ul className="legal-list">
                <li>Accept all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Block all cookies</li>
                <li>Delete existing cookies</li>
              </ul>
            </div>
            
            <div className="manage-option">
              <h3>Our Cookie Consent Tool</h3>
              <p>
                You can change your cookie preferences at any time using our 
                cookie consent tool. Click the cookie icon in the bottom corner 
                of the page or use the button below:
              </p>
              <button onClick={handleResetPreferences} className="btn-cookie-manage">
                Manage Cookie Preferences
              </button>
            </div>
            
            <div className="manage-option">
              <h3>Opt-Out Links</h3>
              <p>
                For third-party cookies, you can opt-out directly:
              </p>
              <ul className="legal-list">
                <li>
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-Out
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/ads/preferences" target="_blank" rel="noopener noreferrer">
                    Facebook Ad Preferences
                  </a>
                </li>
                <li>
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                    Google Ad Settings
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="updates">
          <h2>6. Updates to This Policy</h2>
          <p>
            We may update this Cookies Policy from time to time to reflect 
            changes in our practices or for other operational, legal, or 
            regulatory reasons. The "Last updated" date at the top of this page 
            indicates when this policy was last revised.
          </p>
          <p>
            We encourage you to review this policy periodically to stay 
            informed about how we use cookies.
          </p>
        </section>

        <section id="contact">
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Cookies Policy or our use of 
            cookies, please contact us at:
          </p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>
          </p>
          <p className="legal-meta">
            Response time: We aim to respond to all inquiries within 3-5 business days.
          </p>
        </section>

        <footer>
          <div className="cookie-preferences-status">
            <h3>Your Current Cookie Preferences</h3>
            <div className="preference-status">
              <div className="preference-item">
                <span className="preference-label">Essential Cookies:</span>
                <span className="preference-value active">Always Active</span>
              </div>
              <div className="preference-item">
                <span className="preference-label">Analytics Cookies:</span>
                <span className={`preference-value ${analyticsAccepted ? 'active' : 'inactive'}`}>
                  {analyticsAccepted ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="preference-item">
                <span className="preference-label">Marketing Cookies:</span>
                <span className={`preference-value ${marketingAccepted ? 'active' : 'inactive'}`}>
                  {marketingAccepted ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button onClick={handleResetPreferences} className="btn-cookie-reset">
              Reset All Preferences
            </button>
          </div>
          
          <p className="legal-meta">
            This Cookies Policy is part of our broader Privacy Policy. 
            Please also review our <a href="/privacy" className="underline">Privacy Policy</a> and 
            <a href="/terms" className="underline"> Terms & Conditions</a>.
          </p>
        </footer>
      </div>
    </>
  );
}
