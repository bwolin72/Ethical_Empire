import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [mediaStats, setMediaStats] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [newsletterStats, setNewsletterStats] = useState({ posts: 0, subscribers: 0 });

  useEffect(() => {
    fetchMediaStats();
    fetchReviewCount();
    fetchNewsletterStats();
  }, []);

  const fetchMediaStats = async () => {
    try {
      const res = await axiosInstance.get('/api/media/stats/');
      setMediaStats(res.data); // Format: { EethmHome: { media: 3, banner: 1 }, UserPage: {...}, ... }
    } catch {
      setMediaStats({});
    }
  };

  const fetchReviewCount = async () => {
    try {
      const res = await axiosInstance.get('/api/reviews/');
      setReviewCount(res.data.length);
    } catch {
      setReviewCount(0);
    }
  };

  const fetchNewsletterStats = async () => {
    try {
      const logs = await axiosInstance.get('/api/newsletter/logs/');
      const subs = await axiosInstance.get('/api/newsletter/subscribers/');
      setNewsletterStats({ posts: logs.data.length, subscribers: subs.data.length });
    } catch {
      setNewsletterStats({ posts: 0, subscribers: 0 });
    }
  };

  return (
    <div className="admin-dashboard-preview">
      <div className="overview-grid">
        {/* Booking Overview */}
        <div className="overview-card">
          <h2>Bookings</h2>
          <p>23 active bookings</p>
          <button onClick={() => navigate('/admin?tab=booking')}>Learn More</button>
        </div>

        {/* Videos Overview */}
        <div className="overview-card">
          <h2>Videos</h2>
          <p>Currently showing: Promo Video 1</p>
          <div className="video-nav">
            <button>Prev</button>
            <button>Next</button>
          </div>
          <button onClick={() => navigate('/admin?tab=video')}>Learn More</button>
        </div>

        {/* Invoices Overview */}
        <div className="overview-card">
          <h2>Invoices</h2>
          <p>5 invoices pending</p>
          <button onClick={() => navigate('/admin?tab=invoice')}>Learn More</button>
        </div>

        {/* Media Management Overview */}
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
          <button onClick={() => navigate('/admin/media-management')}>Learn More</button>
        </div>

        {/* Reviews Overview */}
        <div className="overview-card">
          <h2>Reviews</h2>
          <p>{reviewCount} reviews submitted</p>
          <button onClick={() => navigate('/admin/reviews')}>Learn More</button>
        </div>

        {/* Newsletter Overview */}
        <div className="overview-card">
          <h2>Newsletter</h2>
          <p>{newsletterStats.posts} posts • {newsletterStats.subscribers} subscribers</p>
          <button onClick={() => navigate('/admin/newsletter')}>Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
