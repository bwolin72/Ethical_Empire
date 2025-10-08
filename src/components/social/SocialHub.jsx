// src/components/social/SocialHub.jsx
import React from "react";
import { Card } from "../ui/Card";
import {
  Facebook,
  Youtube,
  Music,
  Phone,
  Instagram,
  Twitter,
  MessageCircle,
} from "lucide-react";
import QRCode from "react-qr-code";
import "./SocialMediaPage.css";

const staticLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/16nQGbE7Zk/",
    icon: <Facebook aria-hidden="true" />,
    key: "facebook",
    subtitle: "Follow us on Facebook",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@eethm_gh",
    icon: <Music aria-hidden="true" />,
    key: "tiktok",
    subtitle: "Short-form videos & reels",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ethicalmultimediagh",
    icon: <Youtube aria-hidden="true" />,
    key: "youtube",
    subtitle: "Subscribe for shows & clips",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/eethm_gh01",
    icon: <Instagram aria-hidden="true" />,
    key: "instagram",
    subtitle: "Latest photos & behind-the-scenes",
  },
  {
    name: "Threads",
    url: "https://www.threads.net/eethm_gh01",
    icon: <MessageCircle aria-hidden="true" />, // fallback icon
    key: "threads",
    subtitle: "Join the conversation on Threads",
  },
  {
    name: "Twitter",
    url: "https://x.com/EeTHm_Gh?t=DE32RjXhsgO6A_rgeGIFmA&s=09",
    icon: <Twitter aria-hidden="true" />,
    key: "twitter",
    subtitle: "Follow us for news & updates",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+233552988735",
    icon: <Phone aria-hidden="true" />,
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
        aria-label={`Visit ${link.name}`}
      >
        <div className="social-card-left">
          <span className={`social-icon-wrapper ${link.key}`}>{link.icon}</span>
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

export default function SocialHub({ socialPosts = [] }) {
  const hasFetchedContent = Array.isArray(socialPosts) && socialPosts.length > 0;

  return (
    <main
      className="social-hub-container"
      aria-label="Social media links and latest posts"
    >
      <h1 className="social-hub-title">Connect with Eethm_GH Multimedia</h1>
      <p className="social-hub-sub">
        Follow our channels for event highlights, behind-the-scenes, and the
        latest releases.
      </p>

      <div className="social-grid">
        {/* Social Media Links */}
        <section
          className="social-cards-grid"
          aria-live="polite"
          aria-label="Social media links"
        >
          {staticLinks.map((s) => (
            <SocialCard key={s.key} link={s} />
          ))}
        </section>

        {/* Latest Fetched Posts */}
        <section
          className="social-fetched-posts"
          aria-label="Latest social media updates"
        >
          <h3>Latest Social Updates</h3>
          {hasFetchedContent ? (
            socialPosts.map((post, i) => (
              <Card key={post.id || i} className="social-post-card">
                {post.image && (
                  <img
                    src={post.image}
                    alt={
                      post.caption?.slice(0, 50) ||
                      post.text?.slice(0, 50) ||
                      "Social media post image"
                    }
                    className="social-post-image"
                    loading="lazy"
                  />
                )}
                <div className="social-post-content">
                  <p>{post.caption || post.text || "No description available."}</p>
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View full post"
                    >
                      View Post
                    </a>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <p className="no-social-posts">No recent posts available.</p>
          )}
        </section>

        {/* QR Section */}
        <aside className="qr-section" aria-label="Linktree QR code">
          <div className="qr-title">Scan Our Linktree</div>
          {QRCode && (
            <QRCode
              value="https://linktr.ee/ethicalmultimediagh"
              size={160}
              fgColor="#000000"
            />
          )}
          <p className="qr-note">All our links in one place — tap to explore.</p>
        </aside>
      </div>
    </main>
  );
}
