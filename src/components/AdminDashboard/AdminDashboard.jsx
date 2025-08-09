import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import api from '../../api/api'; // Central API endpoints map
import './AdminDashboard.css';

const AdminDashboard = ({ setActiveTab }) => {
  const [mediaStats, setMediaStats] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [newsletterStats, setNewsletterStats] = useState({ posts: 0, subscribers: 0 });
  const [analytics, setAnalytics] = useState({ visits: 0, users: 0 });

  // Fetch Media Stats (mediaItems endpoint returns array of media items)
  const fetchMediaStats = async () => {
    try {
      const res = await axiosInstance.get(api.media.mediaItems);
      if (Array.isArray(res.data)) {
        setMediaStats({ totalMediaItems: res.data.length });
      } else {
        setMediaStats(res.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch media stats:', err);
      setMediaStats({});
    }
  };

  // Fetch Review Count (reviews.list returns an array of reviews)
  const fetchReviewCount = async () => {
    try {
      const res = await axiosInstance.get(api.reviews.list);
      setReviewCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviewCount(0);
    }
  };

  // Fetch Newsletter Stats (logs endpoint assumed to return an array of posts and subscriber_count)
  const fetchNewsletterStats = async () => {
    try {
      const res = await axiosInstance.get(api.newsletter.logs);
      const postsCount = Array.isArray(res.data.posts) ? res.data.posts.length : (Array.isArray(res.data) ? res.data.length : 0);
      const subscriberCount = res.data.subscriber_count || 0;
      setNewsletterStats({ posts: postsCount, subscribers: subscriberCount });
    } catch (err) {
      console.error('Failed to fetch newsletter stats:', err);
      setNewsletterStats({ posts: 0, subscribers: 0 });
    }
  };

  // Fetch Analytics Data (analytics.site returns { total, unique_users } ideally)
  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get(api.analytics.site);
      setAnalytics({
        visits: res.data?.total || 0,
        users: res.data?.unique_users || 0,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalytics({ visits: 0, users: 0 });
    }
  };

  const fetchAllDashboardData = useCallback(() => {
    fetchMediaStats();
    fetchReviewCount();
    fetchNewsletterStats();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  return (
    <div className="admin-dashboard-preview">
      <h1 className="dashboard-heading">Admin Dashboard</h1>
      <div className="overview-grid">

        <div className="overview-card">
          <h2>Bookings</h2>
          <p>23 active bookings</p>
          <button onClick={() => setActiveTab && setActiveTab('booking')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Videos</h2>
          <p>Currently showing: Promo Video 1</p>
          <div className="video-nav">
            <button>Prev</button>
            <button>Next</button>
          </div>
          <button onClick={() => setActiveTab && setActiveTab('video')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Invoices</h2>
          <p>5 invoices pending</p>
          <button onClick={() => setActiveTab && setActiveTab('invoice')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Media Management</h2>
          {mediaStats && Object.keys(mediaStats).length > 0 ? (
            <table className="media-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Count</th>
                </tr>
              </thead>
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
            <p>Loading media data...</p>
          )}
          <button onClick={() => setActiveTab && setActiveTab('media')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Reviews</h2>
          <p>{reviewCount} reviews submitted</p>
          <button onClick={() => setActiveTab && setActiveTab('reviews')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Newsletter</h2>
          <p>{newsletterStats.posts} posts • {newsletterStats.subscribers} subscribers</p>
          <button onClick={() => setActiveTab && setActiveTab('newsletter')}>Learn More</button>
        </div>

        <div className="overview-card">
          <h2>Analytics</h2>
          <p>{analytics.visits} visits • {analytics.users} users</p>
          <button onClick={() => setActiveTab && setActiveTab('analytics')}>View Analytics</button>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
