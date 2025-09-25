// src/components/social/SocialHub.jsx
import React from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Facebook, Youtube, Music, Phone } from "lucide-react";
import QRCode from "react-qr-code";
import "./SocialMediaPage.css";

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/16nQGbE7Zk/",
    icon: <Facebook className="social-icon facebook" />,
    colorClass: "social-card-facebook",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@eethm_gh?_t=ZM-8zwTexRZBbn&_r=1",
    icon: <Music className="social-icon tiktok" />,
    colorClass: "social-card-tiktok",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ethicalmultimediagh",
    icon: <Youtube className="social-icon youtube" />,
    colorClass: "social-card-youtube",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+233552988735",
    icon: <Phone className="social-icon whatsapp" />,
    colorClass: "social-card-whatsapp",
  },
];

// Reusable Social Card
function SocialCard({ link }) {
  return (
    <Card className={`social-card ${link.colorClass}`}>
      <CardContent className="social-card-content">
        <div className="social-card-left">
          {link.icon}
          <h2 className="social-card-name">{link.name}</h2>
        </div>
        <Button asChild>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            Visit
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SocialHub() {
  return (
    <div className="social-hub-container">
      <h1 className="social-hub-title">Connect with Eethm_GH Multimedia</h1>

      <div className="social-cards-grid">
        {socialLinks.map((link, index) => (
          <SocialCard key={index} link={link} />
        ))}
      </div>

      <div className="qr-section">
        <h2 className="qr-title">Scan Our Linktree</h2>
        <QRCode value="https://linktr.ee/ethicalmultimediagh" size={160} fgColor="#000000" />
        <p className="qr-note">All our links in one place</p>
      </div>
    </div>
  );
}
