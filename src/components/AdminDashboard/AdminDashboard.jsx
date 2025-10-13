import React, { useEffect, useState, useCallback } from "react";
import videoService from "../../api/services/videoService"; // updated backend service
import bookingService from "../../api/services/bookingService";
import invoiceService from "../../api/services/invoiceService";
import mediaService from "../../api/services/mediaService";
import reviewService from "../../api/services/reviewService";
import newsletterService from "../../api/services/newsletterService";
import analyticsService from "../../api/services/analyticsService";
import "./AdminDashboard.css";

const AdminDashboard = ({ setActiveTab }) => {
  // ==== STATE ====
  const [bookings, setBookings] = useState({ active: 0 });
  const [videos, setVideos] = useState([]);
  const [invoices, setInvoices] = useState({ pending: 0 });
  const [mediaStats, setMediaStats] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [newsletterStats, setNewsletterStats] = useState({ posts: 0, subscribers: 0 });
  const [analytics, setAnalytics] = useState({ visits: 0, users: 0 });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Loading & error states
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const setLoadingState = (key, value) => setLoading((prev) => ({ ...prev, [key]: value }));
  const setErrorState = (key, value) => setError((prev) => ({ ...prev, [key]: value }));

  // ==== FETCHERS ====

  const fetchBookings = async () => {
    setLoadingState("bookings", true);
    setErrorState("bookings", null);
    try {
      const res = await bookingService.list();
      const data = Array.isArray(res.data) ? res.data : [];
      const activeCount = data.filter((b) => b.status?.toLowerCase() === "active").length;
      setBookings({ active: activeCount });
    } catch (err) {
      console.error("Bookings error:", err);
      setErrorState("bookings", "Failed to fetch bookings");
    } finally {
      setLoadingState("bookings", false);
    }
  };

  const fetchVideos = async () => {
    setLoadingState("videos", true);
    setErrorState("videos", null);
    try {
      const res = await videoService.list(); // returns array of video objects
      const activeVideos = Array.isArray(res)
        ? res.filter((v) => v.is_active)
        : [];
      setVideos(activeVideos);
    } catch (err) {
      console.error("Videos error:", err);
      setErrorState("videos", "Failed to fetch videos");
    } finally {
      setLoadingState("videos", false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingState("invoices", true);
    setErrorState("invoices", null);
    try {
      const res = await invoiceService.fetchInvoices();
      const data = Array.isArray(res) ? res : [];
      const pendingCount = data.filter((inv) => inv.status?.toLowerCase() === "pending").length;
      setInvoices({ pending: pendingCount });
    } catch (err) {
      console.error("Invoices error:", err);
      setErrorState("invoices", "Failed to fetch invoices");
    } finally {
      setLoadingState("invoices", false);
    }
  };

  const fetchMediaStats = async () => {
    setLoadingState("media", true);
    setErrorState("media", null);
    try {
      const res = await mediaService.list();
      if (Array.isArray(res.data)) {
        setMediaStats({ totalMediaItems: res.data.length });
      } else if (res.data && typeof res.data === "object") {
        const safeStats = {};
        for (const [key, value] of Object.entries(res.data)) {
          safeStats[key] = typeof value === "object" ? JSON.stringify(value) : value;
        }
        setMediaStats(safeStats);
      } else {
        setMediaStats({});
      }
    } catch (err) {
      console.error("Media error:", err);
      setErrorState("media", "Failed to fetch media stats");
    } finally {
      setLoadingState("media", false);
    }
  };

  const fetchReviews = async () => {
    setLoadingState("reviews", true);
    setErrorState("reviews", null);
    try {
      const res = await reviewService.getAllReviewsAdmin();
      setReviewCount(Array.isArray(res) ? res.length : 0);
    } catch (err) {
      console.error("Reviews error:", err);
      setErrorState("reviews", "Failed to fetch reviews");
    } finally {
      setLoadingState("reviews", false);
    }
  };

  const fetchNewsletterStats = async () => {
    setLoadingState("newsletter", true);
    setErrorState("newsletter", null);
    try {
      const logs = await newsletterService.getNewsletterLogs();
      const subscriberCount = await newsletterService.getSubscriberCount();
      const postsCount = Array.isArray(logs) ? logs.length : 0;
      setNewsletterStats({ posts: postsCount, subscribers: subscriberCount || 0 });
    } catch (err) {
      console.error("Newsletter error:", err);
      setErrorState("newsletter", "Failed to fetch newsletter stats");
    } finally {
      setLoadingState("newsletter", false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingState("analytics", true);
    setErrorState("analytics", null);
    try {
      const res = await analyticsService.site();
      setAnalytics({
        visits: res.data?.total || 0,
        users: res.data?.unique_users || 0,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setErrorState("analytics", "Failed to fetch analytics");
    } finally {
      setLoadingState("analytics", false);
    }
  };

  // ==== MASTER FETCH ====
  const fetchAllDashboardData = useCallback(() => {
    fetchBookings();
    fetchVideos();
    fetchInvoices();
    fetchMediaStats();
    fetchReviews();
    fetchNewsletterStats();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // ==== VIDEO NAVIGATION ====
  const handlePrevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };
  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const getVideoTitle = (video) => video?.title || "Untitled";
  const getVideoStatus = (video) =>
    video?.is_active ? (video.is_featured ? "⭐ Featured" : "Active") : "Inactive";

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <main className="dashboard-grid">
        {/* BOOKINGS */}
        <section className="dashboard-card">
          <h2>📅 Bookings</h2>
          {loading.bookings ? (
            <p>Loading bookings...</p>
          ) : error.bookings ? (
            <p className="error">{error.bookings}</p>
          ) : (
            <p>{bookings.active} active bookings</p>
          )}
          <button onClick={() => setActiveTab?.("booking")}>View Bookings</button>
        </section>

        {/* VIDEOS */}
        <section className="dashboard-card">
          <h2>🎥 Videos</h2>
          {loading.videos ? (
            <p>Loading videos...</p>
          ) : error.videos ? (
            <p className="error">{error.videos}</p>
          ) : videos.length > 0 ? (
            <>
              <p>
                {getVideoTitle(videos[currentVideoIndex])} • {getVideoStatus(videos[currentVideoIndex])}
              </p>
              <div className="video-controls">
                <button onClick={handlePrevVideo}>Prev</button>
                <button onClick={handleNextVideo}>Next</button>
              </div>
            </>
          ) : (
            <p>No videos available</p>
          )}
          <button onClick={() => setActiveTab?.("video")}>Manage Videos</button>
        </section>

        {/* INVOICES */}
        <section className="dashboard-card">
          <h2>🧾 Invoices</h2>
          {loading.invoices ? (
            <p>Loading invoices...</p>
          ) : error.invoices ? (
            <p className="error">{error.invoices}</p>
          ) : (
            <p>{invoices.pending} invoices pending</p>
          )}
          <button onClick={() => setActiveTab?.("invoice")}>View Invoices</button>
        </section>

        {/* MEDIA */}
        <section className="dashboard-card">
          <h2>📁 Media</h2>
          {loading.media ? (
            <p>Loading media stats...</p>
          ) : error.media ? (
            <p className="error">{error.media}</p>
          ) : Object.keys(mediaStats).length > 0 ? (
            <table className="media-stats">
              <tbody>
                {Object.entries(mediaStats).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No media data available</p>
          )}
          <button onClick={() => setActiveTab?.("media")}>Manage Media</button>
        </section>

        {/* REVIEWS */}
        <section className="dashboard-card">
          <h2>⭐ Reviews</h2>
          {loading.reviews ? (
            <p>Loading reviews...</p>
          ) : error.reviews ? (
            <p className="error">{error.reviews}</p>
          ) : (
            <p>{reviewCount} reviews submitted</p>
          )}
          <button onClick={() => setActiveTab?.("reviews")}>Manage Reviews</button>
        </section>

        {/* NEWSLETTER */}
        <section className="dashboard-card">
          <h2>📬 Newsletter</h2>
          {loading.newsletter ? (
            <p>Loading newsletter stats...</p>
          ) : error.newsletter ? (
            <p className="error">{error.newsletter}</p>
          ) : (
            <p>
              {newsletterStats.posts} posts • {newsletterStats.subscribers} subscribers
            </p>
          )}
          <button onClick={() => setActiveTab?.("newsletter")}>View Newsletter</button>
        </section>

        {/* ANALYTICS */}
        <section className="dashboard-card">
          <h2>📊 Analytics</h2>
          {loading.analytics ? (
            <p>Loading analytics...</p>
          ) : error.analytics ? (
            <p className="error">{error.analytics}</p>
          ) : (
            <p>
              {analytics.visits} visits • {analytics.users} users
            </p>
          )}
          <button onClick={() => setActiveTab?.("analytics")}>View Analytics</button>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
