import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import {
  Facebook,
  Youtube,
  Music,
  Phone,
  Instagram,
  Twitter,
  MessageCircle,
  ExternalLink,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";
import "./SocialHub.css";

// Static social links
const staticLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/16nQGbE7Zk/",
    icon: <Facebook size={20} aria-hidden="true" />,
    key: "facebook",
    subtitle: "Follow us on Facebook",
    color: "var(--burgundy)",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@eethm_gh",
    icon: <Music size={20} aria-hidden="true" />,
    key: "tiktok",
    subtitle: "Short-form videos & reels",
    color: "var(--charcoal)",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ethicalmultimediagh",
    icon: <Youtube size={20} aria-hidden="true" />,
    key: "youtube",
    subtitle: "Subscribe for shows & clips",
    color: "var(--navy)",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/eethm_gh01",
    icon: <Instagram size={20} aria-hidden="true" />,
    key: "instagram",
    subtitle: "Latest photos & behind-the-scenes",
    color: "var(--gold)",
  },
  {
    name: "Threads",
    url: "https://www.threads.net/eethm_gh01",
    icon: <MessageCircle size={20} aria-hidden="true" />,
    key: "threads",
    subtitle: "Join the conversation",
    color: "var(--charcoal)",
  },
  {
    name: "Twitter (X)",
    url: "https://x.com/EeTHm_Gh?t=DE32RjXhsgO6A_rgeGIFmA&s=09",
    icon: <Twitter size={20} aria-hidden="true" />,
    key: "twitter",
    subtitle: "Follow for news & updates",
    color: "var(--navy)",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+233552988735",
    icon: <Phone size={20} aria-hidden="true" />,
    key: "whatsapp",
    subtitle: "Message us directly",
    color: "var(--forest)",
  },
];

// Social Card Component
function SocialCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-card"
      aria-label={`Visit ${link.name}`}
      style={{ "--card-color": link.color }}
    >
      <div className="card-icon" style={{ backgroundColor: link.color }}>
        {link.icon}
      </div>
      <div className="card-content">
        <h4 className="card-title">{link.name}</h4>
        <p className="card-subtitle">{link.subtitle}</p>
      </div>
      <div className="card-action">
        <ExternalLink size={16} />
      </div>
    </a>
  );
}

// Post Card Component
function PostCard({ post, index }) {
  const platformIcons = {
    facebook: <Facebook size={16} />,
    instagram: <Instagram size={16} />,
    youtube: <Youtube size={16} />,
    tiktok: <Music size={16} />,
    twitter: <Twitter size={16} />,
    default: <MessageCircle size={16} />,
  };

  const platform = post.platform?.toLowerCase();
  const icon = platformIcons[platform] || platformIcons.default;

  return (
    <article className="post-card" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="post-header">
        <div className="platform-badge">
          <span className="platform-icon">{icon}</span>
          <span className="platform-name">{platform || "Social"}</span>
        </div>
        <time className="post-date" dateTime={post.created_at}>
          {new Date(post.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      <div className="post-content">
        <p className="post-text">
          {post.content?.slice(0, 120) || "New update from our team..."}
          {post.content?.length > 120 && "..."}
        </p>
      </div>
      {post.external_url && (
        <a
          href={post.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="post-link"
          aria-label="View full post"
        >
          View Full Post <ExternalLink size={14} />
        </a>
      )}
    </article>
  );
}

// Main SocialHub Component
export default function SocialHub({ socialPosts = [] }) {
  useEffect(() => {
    document.title = "EETHM Social Hub • Connect & Engage";
  }, []);

  const hasPosts = Array.isArray(socialPosts) && socialPosts.length > 0;
  const recentPosts = socialPosts.slice(0, 3); // Show only 3 recent posts

  return (
    <div className="social-hub theme-multimedia">
      {/* Header */}
      <header className="social-header animate-fade-in-up">
        <div className="header-content">
          <div className="header-badge">
            <Sparkles size={16} />
            <span>Social Hub</span>
          </div>
          <h1 className="page-title">
            Connect with <span className="gradient-text">EETHM Multimedia</span>
          </h1>
          <p className="page-subtitle">
            Follow our channels for event highlights, behind-the-scenes, and the latest releases.
            One link to connect everywhere.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <Users size={20} />
            <div>
              <span className="stat-number">500+</span>
              <span className="stat-label">Community</span>
            </div>
          </div>
          <div className="stat-item">
            <Calendar size={20} />
            <div>
              <span className="stat-number">50+</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="social-main">
        {/* Social Links Grid */}
        <section className="social-links-section">
          <div className="section-header">
            <h2 className="section-title">Our Social Channels</h2>
            <p className="section-description">
              Connect with us across platforms for updates, behind-the-scenes, and more.
            </p>
          </div>
          
          <div className="social-grid">
            {staticLinks.map((link) => (
              <SocialCard key={link.key} link={link} />
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="content-columns">
          {/* Left Column - Recent Posts */}
          <div className="left-column">
            <section className="posts-section">
              <div className="section-header">
                <h2 className="section-title">Recent Updates</h2>
                <p className="section-description">
                  Latest posts from our social channels
                </p>
              </div>
              
              {hasPosts ? (
                <div className="posts-grid">
                  {recentPosts.map((post, index) => (
                    <PostCard key={post.id || index} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <div className="empty-posts">
                  <div className="empty-icon">📱</div>
                  <h3>No recent posts</h3>
                  <p>Follow us to see our latest updates!</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - QR & CTA */}
          <aside className="right-column">
            <div className="qr-card">
              <div className="qr-header">
                <h3 className="qr-title">All Links in One</h3>
                <p className="qr-subtitle">Scan to open our Linktree</p>
              </div>
              
              <div className="qr-container">
                <QRCode
                  value="https://linktr.ee/ethicalmultimediagh"
                  size={180}
                  bgColor="var(--color-surface)"
                  fgColor="var(--charcoal)"
                  level="M"
                />
                <div className="qr-overlay">
                  <Sparkles size={20} />
                </div>
              </div>
              
              <div className="qr-footer">
                <p className="qr-note">
                  Scan this QR code to access all our social links in one place.
                </p>
                <a
                  href="https://linktr.ee/ethicalmultimediagh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qr-link"
                  aria-label="Open Linktree"
                >
                  Open Linktree <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Community CTA */}
            <div className="community-cta">
              <div className="cta-icon">👥</div>
              <h4>Join Our Community</h4>
              <p>Be part of our growing network of creatives and professionals.</p>
              <button className="btn-outline" aria-label="Join community">
                Connect Now
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
