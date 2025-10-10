import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Menu,
  X,
  Settings,
  LogOut,
  Sun,
  Moon,
  MessageCircle,
  Film,
  Image,
  Star,
  Mail,
  Clock,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { useProfile } from "../context/ProfileContext";
import apiService from "../../api/apiService";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import GalleryWrapper from "../gallery/GalleryWrapper";
import VideoGallery from "../videos/VideoGallery";
import Reviews from "./Reviews";
import NewsletterSignup from "./NewsLetterSignup";
import ProfileAvatar from "./ProfileAvatar";

import "./UserPage.css";

const UserPage = () => {
  const { profile, updateProfile } = useProfile();
  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const extractList = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mediaRes, reviewsRes, promoRes, videosRes, msgRes] = await Promise.all([
          apiService.media?.user?.({ signal: controller.signal }) ?? { data: [] },
          apiService.reviews?.list?.({ signal: controller.signal }) ?? { data: [] },
          apiService.promotions?.active?.({ signal: controller.signal }) ?? { data: [] },
          apiService.videos?.list?.({ signal: controller.signal }) ?? { data: [] },
          apiService.messages?.unreadCount?.({ signal: controller.signal }) ?? { data: 0 },
        ]);

        setMedia(extractList(mediaRes));
        setReviews(extractList(reviewsRes));
        setPromotions(extractList(promoRes));
        setVideos(extractList(videosRes));
        setUnreadCount(msgRes.data ?? 0);
      } catch (err) {
        if (err?.name !== "CanceledError") {
          console.error("Dashboard fetch error:", err);
          toast.error("Error loading your dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const featuredVideo = videos.find(
    (item) => (item.is_featured || item.featured) && (item.file || item.url || item.video_url)
  );

  return (
    <div className={`user-dashboard ${darkMode ? "dark" : "light"}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <ProfileAvatar profile={profile} onProfileUpdate={updateProfile} />
          <h3>{profile?.name || "User"}</h3>
        </div>

        <nav className="sidebar-menu">
          <button onClick={() => navigate("/account")}><Settings size={18}/> Account Settings</button>
          <button onClick={() => navigate("/newsletter")}><Mail size={18}/> Newsletter</button>
          <button onClick={() => navigate("/reviews")}><Star size={18}/> My Reviews</button>
          <button onClick={() => navigate("/booking-history")}><Clock size={18}/> Booking History</button>
          <button onClick={() => navigate("/social")}><Image size={18}/> Social Hub</button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => navigate("/logout")}>
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="dashboard-header glass-card">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle btn-icon">
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div>
              <h2>Hey {profile?.name || "Guest"} 👋</h2>
              <p>Welcome to your creative space.</p>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={toggleDarkMode} className="btn-icon">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={() => navigate("/messaging")} className="btn-icon">
              <MessageCircle size={22}/>
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          </div>
        </header>

        {/* Sections */}
        {promotions.length > 0 && (
          <section className="banner-section fade-in">
            <h3>🔥 Promotions</h3>
            <BannerCards banners={promotions}/>
          </section>
        )}

        {featuredVideo && (
          <section className="featured-section card scale-in">
            <h3><Film size={18}/> Featured Video</h3>
            <video
              className="featured-video"
              controls
              preload="metadata"
              src={featuredVideo.file || featuredVideo.video_url || featuredVideo.url}
            />
          </section>
        )}

        {videos.length > 0 && (
          <section className="video-gallery-section fade-in">
            <h3><Film size={18}/> Your Videos</h3>
            <VideoGallery videos={videos}/>
          </section>
        )}

        <section className="gallery-section fade-in">
          <h3><Image size={18}/> Your Gallery</h3>
          {media.length > 0 ? (
            <GalleryWrapper>
              <div className="gallery-grid">
                {media.map((item, idx) => <MediaCards key={idx} media={item}/>)}
              </div>
            </GalleryWrapper>
          ) : (
            <p className="empty-text">✨ Upload your first media to shine!</p>
          )}
        </section>

        <section className="reviews-section fade-in">
          <h3><Star size={18}/> Reviews</h3>
          {reviews.length > 0 ? <Reviews reviews={reviews}/> : <p className="empty-text">No reviews yet.</p>}
        </section>

        <section className="newsletter-section fade-in">
          <h3><Mail size={18}/> Stay Updated</h3>
          <NewsletterSignup/>
        </section>

        {loading && <div className="loading-overlay">Loading...</div>}
      </main>
    </div>
  );
};

export default UserPage;
