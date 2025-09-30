// src/components/social/SocialHub.jsx
import React from "react";
import { Card } from "../ui/Card";
import { Facebook, Youtube, Music, Phone } from "lucide-react";
import QRCode from "react-qr-code";
import "./SocialMediaPage.css";

const staticLinks = [
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

export default function SocialHub({ socialPosts = [] }) {
  const hasFetchedContent = Array.isArray(socialPosts) && socialPosts.length > 0;

  return (
    <main className="social-hub-container">
      <h1 className="social-hub-title">Connect with Eethm_GH Multimedia</h1>
      <p className="social-hub-sub">
        Follow our channels for event highlights, behind-the-scenes, and the latest releases.
      </p>

      <div className="social-grid">
        {/* Left: links */}
        <div className="social-cards-grid" aria-live="polite">
          {staticLinks.map((s) => (
            <SocialCard key={s.key} link={s} />
          ))}
        </div>

        {/* Right: Fetched content */}
        <div className="social-fetched-posts">
          <h3>Latest Social Updates</h3>
          {hasFetchedContent ? (
            socialPosts.map((post, i) => (
              <Card key={post.id || i} className="social-post-card">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.caption?.slice(0, 40) || "Social media post"}
                    className="social-post-image"
                  />
                )}
                <div className="social-post-content">
                  <p>{post.caption || post.text || "No description"}</p>
                  {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                      View Post
                    </a>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <p className="no-social-posts">No recent posts available.</p>
          )}
        </div>

        {/* QR */}
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
