import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import api from '../../api/api'; // ✅ new central API map
import './AdminDashboard.css';

const AdminDashboard = ({ setActiveTab }) => {
  const [mediaStats, setMediaStats] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [newsletterStats, setNewsletterStats] = useState({ posts: 0, subscribers: 0 });
  const [analytics, setAnalytics] = useState({ visits: 0, users: 0 });

  const fetchMediaStats = async () => {
    try {
      const res = await axiosInstance.get(api.media.stats);
      setMediaStats(typeof res.data === 'object' ? res.data : {});
    } catch (err) {
      console.error('Failed to fetch media stats:', err);
    }
  };

  const fetchReviewCount = async () => {
    try {
      const res = await axiosInstance.get(api.reviews.list);
      setReviewCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchNewsletterStats = async () => {
    try {
      const logsRes = await axiosInstance.get(api.newsletter.logs);
      const subsRes = await axiosInstance.get(api.newsletter.count);
      setNewsletterStats({
        posts: Array.isArray(logsRes.data) ? logsRes.data.length : 0,
        subscribers: subsRes.data?.count || 0,
      });
    } catch (err) {
      console.error('Failed to fetch newsletter stats:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get(api.analytics.stats);
      setAnalytics({
        visits: res.data?.total || 0,
        users: res.data?.unique_users || 0,
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
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
          {Object.keys(mediaStats).length > 0 ? (
            <table className="media-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Media</th>
                  <th>Banner</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mediaStats).map(([endpoint, data]) => (
                  <tr key={endpoint}>
                    <td>{endpoint}</td>
                    <td>{data.media || 0}</td>
                    <td>{data.banner || 0}</td>
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
