import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import { useAuth } from "../context/AuthContext";
import apiService from "../../api/apiService";

import BannerCards from "../context/BannerCards";
import MediaCards from "../context/MediaCards";
import VideoGallery from "../videos/VideoGallery";
import ReviewsLayout from "./ReviewsLayout";
import Reviews from "./Reviews";
import NewsletterSignup from "./NewsLetterSignup";
import ProfileAvatar from "./ProfileAvatar";

import UpdatePassword from "./UpdatePassword";
import EditProfile from "./EditProfile";
import AccountProfile from "./AccountProfile";
import ConfirmPasswordChange from "./ConfirmPasswordChange";
import UnsubscribePage from "./UnsubscribePage";
import ResubscribePage from "./ResubscribePage";

import "./UserPage.css";
import { v4 as uuid } from "uuid";

const safeLocalStorageGet = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const UserPage = () => {
  const { profile, updateProfile } = useProfile();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [media, setMedia] = useState([]);
  const [videos, setVideos] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    safeLocalStorageGet("darkMode", "false") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const abortController = useRef(null);

  const handleError = useCallback((message, err) => {
    console.error(message, err);
    toast.error(message || "An error occurred. Please try again.");
  }, []);

  const extractList = useCallback((res) => {
    const data = res?.data ?? res;
    if (!data) return [];
    return (
      data.results ??
      data.data ??
      (Array.isArray(data) ? data : [])
    );
  }, []);

  // Securely fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    try {
      const { signal } = abortController.current;
      const [
        mediaRes,
        reviewsRes,
        promoRes,
        videosRes,
        msgRes,
      ] = await Promise.allSettled([
        apiService.media?.user?.({ signal }),
        apiService.reviews?.list?.({ signal }),
        apiService.promotions?.active?.({ signal }),
        apiService.videos?.list?.({ signal }),
        apiService.messages?.unreadCount?.({ signal }),
      ]);

      if (mediaRes.status === "fulfilled")
        setMedia(extractList(mediaRes.value));
      if (reviewsRes.status === "fulfilled")
        setReviews(extractList(reviewsRes.value));
      if (promoRes.status === "fulfilled")
        setPromotions(extractList(promoRes.value));
      if (videosRes.status === "fulfilled")
        setVideos(extractList(videosRes.value));
      if (msgRes.status === "fulfilled")
        setUnreadCount(msgRes.value?.data ?? 0);
    } catch (err) {
      if (err?.name !== "CanceledError") handleError("Error loading dashboard.", err);
    } finally {
      setLoading(false);
    }
  }, [extractList, handleError]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchDashboardData();

    return () => {
      abortController.current?.abort();
    };
  }, [fetchDashboardData, isAuthenticated, navigate]);

  // Toggle dark mode safely
  const toggleDarkMode = useCallback(() => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      localStorage.setItem("darkMode", newMode);
    } catch (err) {
      console.warn("Could not persist dark mode:", err);
    }
  }, [darkMode]);

  // Derived states
  const featuredVideo = useMemo(
    () =>
      videos.find(
        (v) =>
          (v.is_featured || v.featured) &&
          (v.file || v.url || v.video_url)
      ),
    [videos]
  );

  const userServices = useMemo(
    () => [
      {
        name: "Profile Management",
        components: [
          <AccountProfile key={uuid()} />,
          <EditProfile key={uuid()} />,
        ],
      },
      {
        name: "Password & Security",
        components: [
          <UpdatePassword key={uuid()} />,
          <ConfirmPasswordChange key={uuid()} />,
        ],
      },
      {
        name: "Subscription",
        components: [
          <UnsubscribePage key={uuid()} />,
          <ResubscribePage key={uuid()} />,
        ],
      },
    ],
    []
  );

  // Handlers
  const handleBookingClick = useCallback(
    () => navigate("/bookings"),
    [navigate]
  );

  const handleLogout = useCallback(() => {
    logout("manual");
    toast.info("You have been logged out.");
  }, [logout]);

  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !prev),
    []
  );

  if (!isAuthenticated) return null;

  return (
    <div className={`user-dashboard ${darkMode ? "dark" : "light"}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <ProfileAvatar
            profile={profile}
            onProfileUpdate={updateProfile}
          />
          <h3>{profile?.name || "User"}</h3>
        </div>

        <nav className="sidebar-menu">
          <button onClick={() => navigate("/account")}>
            <Settings size={18} /> Account Settings
          </button>
          <button onClick={() => navigate("/newsletter")}>
            <Mail size={18} /> Newsletter
          </button>
          <button onClick={() => navigate("/reviews")}>
            <Star size={18} /> My Reviews
          </button>
          <button onClick={() => navigate("/booking-history")}>
            <Clock size={18} /> Booking History
          </button>
          <button onClick={() => navigate("/social")}>
            <Image size={18} /> Social Hub
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay show"
          onClick={toggleSidebar}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="dashboard-header glass-card">
          <div className="header-left">
            <button
              onClick={toggleSidebar}
              className="menu-toggle btn-icon"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h2>
                Hey {profile?.name || "Guest"} 👋
              </h2>
              <p>Welcome to your creative space.</p>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={toggleDarkMode} className="btn-icon">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => navigate("/messaging")}
              className="btn-icon"
            >
              <MessageCircle size={22} />
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
          </div>
        </header>

        {/* Promotions */}
        {promotions.length > 0 && (
          <section className="banner-section fade-in">
            <h3>🔥 Promotions</h3>
            <BannerCards banners={promotions} />
          </section>
        )}

        {/* Featured Video */}
        {featuredVideo && (
          <section className="featured-section card scale-in">
            <h3>
              <Film size={18} /> Featured Video
            </h3>
            <video
              className="featured-video"
              controls
              preload="metadata"
              src={
                featuredVideo.file ||
                featuredVideo.video_url ||
                featuredVideo.url
              }
            />
          </section>
        )}

        {/* Video Gallery */}
        {videos.length > 0 && (
          <section className="video-gallery-section fade-in">
            <h3>
              <Film size={18} /> Your Videos
            </h3>
            <VideoGallery videos={videos} />
          </section>
        )}

        {/* Media Gallery */}
        <section className="gallery-section fade-in">
          <h3>
            <Image size={18} /> Your Gallery
          </h3>
          {media.length > 0 ? (
            <div className="gallery-grid">
              {media.map((item) => (
                <MediaCards key={uuid()} media={item} />
              ))}
            </div>
          ) : (
            <p className="empty-text">
              ✨ Upload your first media to shine!
            </p>
          )}
        </section>

        {/* Reviews */}
        <ReviewsLayout
          title="Client Feedback"
          description="See what others are saying about your work"
        >
          {reviews.length > 0 ? (
            <Reviews reviews={reviews} />
          ) : (
            <p className="empty-text">No reviews yet.</p>
          )}
        </ReviewsLayout>

        {/* Newsletter */}
        <section className="newsletter-section fade-in">
          <h3>
            <Mail size={18} /> Stay Updated
          </h3>
          <NewsletterSignup />
        </section>

        {/* Services */}
        <section className="services-section fade-in">
          <h3>🛠 Your Services</h3>
          {userServices.map((service) => (
            <div key={uuid()} className="service-card glass-card">
              <h4>{service.name}</h4>
              <div className="service-components">
                {service.components}
              </div>
              <button
                className="btn btn-primary mt-2"
                onClick={handleBookingClick}
              >
                Book {service.name}
              </button>
            </div>
          ))}
        </section>

        {loading && <div className="loading-overlay">Loading...</div>}
      </main>
    </div>
  );
};

export default UserPage;
