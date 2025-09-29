// src/components/social/SocialHub.jsx
import React from "react";
import { Card } from "../ui/Card";
import { Facebook, Youtube, Music, Phone } from "lucide-react";
import QRCode from "react-qr-code";
import "./SocialHub.css"; // make sure filename matches

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/16nQGbE7Zk/",
    icon: <Facebook />,
    key: "facebook",
    subtitle: "Follow us on Facebook",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@eethm_gh",
    icon: <Music />,
    key: "tiktok",
    subtitle: "Short form videos & reels",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ethicalmultimediagh",
    icon: <Youtube />,
    key: "youtube",
    subtitle: "Subscribe for shows & clips",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+233552988735",
    icon: <Phone />,
    key: "whatsapp",
    subtitle: "Message us directly",
  },
];

function SocialCard({ link }) {
  return (
    <Card className="social-card" role="group" aria-label={link.name}>
      <a
        className="social-card-link"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${link.name} in new tab`}
      >
        <div className="social-card-left">
          <span className={`social-icon-wrapper ${link.key}`}>
            {React.cloneElement(link.icon, { "aria-hidden": true })}
          </span>

          <div className="social-card-meta">
            <div className="social-card-name">{link.name}</div>
            <div className="social-card-sub">{link.subtitle}</div>
          </div>
        </div>

        <span className="social-cta">Visit</span>
      </a>
    </Card>
  );
}

export default function SocialHub() {
  return (
    <main className="social-hub-container">
      <h1 className="social-hub-title">Connect with Eethm_GH Multimedia</h1>
      <p className="social-hub-sub">
        Follow our channels for event highlights, behind-the-scenes, and the latest releases.
      </p>

      <div className="social-grid">
        {/* left: cards grid */}
        <div className="social-cards-grid" aria-live="polite">
          {socialLinks.map((s) => (
            <SocialCard key={s.key} link={s} />
          ))}
        </div>

        {/* right: QR / linktree panel */}
        <aside className="qr-section" aria-label="Linktree QR code">
          <div className="qr-title">Scan Our Linktree</div>
          <QRCode
            value="https://linktr.ee/ethicalmultimediagh"
            size={160}
            fgColor="#000000"
          />
          <p className="qr-note">All our links in one place — tap to explore.</p>
        </aside>
      </div>
    </main>
  );
}
