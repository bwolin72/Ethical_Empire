// src/components/social/SocialHub.jsx
import React, { useEffect } from "react";
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
import "./SocialHub.css";

// ==========================
// 🔗 Static Social Links
// ==========================
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
    icon: <MessageCircle aria-hidden="true" />,
    key: "threads",
    subtitle: "Join the conversation on Threads",
  },
  {
    name: "Twitter (X)",
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

// ==========================
// 🎴 Social Card
// ==========================
function SocialCard({ link }) {
  return (
    <Card className="social-card" role="group" aria-label={link.name}>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${link.name}`}
        className="social-card-link"
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

// ==========================
// 🌐 Main Social Hub
// ==========================
export default function SocialHub({ socialPosts = [] }) {
  useEffect(() => {
    document.title = "EETHM Social Hub • Connect & Engage";
  }, []);

  const hasPosts = Array.isArray(socialPosts) && socialPosts.length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main
      className="social-hub-container"
      aria-label="EETHM Social media links and latest posts"
    >
      {/* === Header === */}
      <header className="header-wrap">
        <h1 className="social-hub-title">Connect with EETHM Multimedia</h1>

        {/* 🎉 Marquee */}
        <div className="marquee-bar" role="presentation" aria-hidden="true">
          <div className="marquee">
            <span>🎥 EETHM Multimedia • Events</span>
            <span>📸 Creative Production • Digital Media</span>
            <span>🎶 Shows & Reels • Social Buzz</span>
            <span>🌐 Connect • Engage • Inspire</span>
          </div>
        </div>

        <p className="social-hub-sub">
          Follow our channels for event highlights, behind-the-scenes, and the latest releases.
        </p>
      </header>

      {/* === Layout === */}
      <div className="social-grid">
        {/* Left: Links & Posts */}
        <div className="left-stack">
          {/* Static Links */}
          <section className="social-cards-grid" aria-label="Social media links">
            {staticLinks.map((link) => (
              <SocialCard key={link.key} link={link} />
            ))}
          </section>

          {/* Dynamic Posts */}
          <section
            className="social-fetched-posts"
            aria-label="Latest social media updates"
            aria-live="polite"
          >
            <h3>Latest Social Updates</h3>

            {hasPosts ? (
              socialPosts.map((post, i) => {
                const platformIcon =
                  post.platform === "facebook" ? (
                    <Facebook />
                  ) : post.platform === "instagram" ? (
                    <Instagram />
                  ) : post.platform === "youtube" ? (
                    <Youtube />
                  ) : post.platform === "tiktok" ? (
                    <Music />
                  ) : post.platform === "twitter" ? (
                    <Twitter />
                  ) : (
                    <MessageCircle />
                  );

                return (
                  <Card key={post.id || i} className="social-post-card">
                    <div className="social-post-header">
                      <span className="platform-icon">{platformIcon}</span>
                      <span className="platform-name">
                        {post.platform?.toUpperCase() || "Unknown"}
                      </span>
                    </div>

                    <div className="social-post-content">
                      {formatDate(post.created_at) && (
                        <div className="post-date">
                          {formatDate(post.created_at)}
                        </div>
                      )}
                      <p>
                        {post.status === "published"
                          ? "New update posted!"
                          : `Status: ${post.status}`}
                      </p>

                      {post.external_url && (
                        <a
                          href={post.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View full post"
                          className="view-post-link"
                        >
                          View Post
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <p className="no-social-posts">No recent social posts available.</p>
            )}
          </section>
        </div>

        {/* Right: QR */}
        <aside className="qr-section" aria-label="Linktree QR code">
          <div className="qr-title">Scan Our Linktree</div>
          <div className="qr-wrap">
            <QRCode
              value="https://linktr.ee/ethicalmultimediagh"
              size={160}
              fgColor="#000000"
            />
          </div>
          <p className="qr-note">All our links in one place — tap to explore.</p>
          <div className="qr-badge">✨ All Links Unified ✨</div>
        </aside>
      </div>
    </main>
  );
}
