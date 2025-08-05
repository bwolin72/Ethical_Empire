import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Card, CardContent } from '../ui/Card';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProfileAvatar from '../user/ProfileAvatar';
import './PartnerVendorDashboard.css';

const PartnerVendorDashboard = () => {
  const [userType, setUserType] = useState(null); // 'partner' or 'vendor'
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await axiosInstance.get('/accounts/user-role/');
        const type = userRes.data.type;
        setUserType(type);

        const profileRes = await axiosInstance.get(`/accounts/${type}-profile/`);
        const statsRes = await axiosInstance.get(`/${type}s/dashboard-stats/`);
        const chartRes = await axiosInstance.get(`/${type}s/activity-chart/`);
        const videosRes = await axiosInstance.get('/api/videos/', {
          params: {
            endpoint: 'AgencyDashboard',
            is_active: true,
          },
        });

        setProfile(profileRes.data);
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setVideos(videosRes.data?.results || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="dashboard-container">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav>
          <ul>
            <li><a href="/dashboard">Overview</a></li>
            <li><a href="/account">Edit Profile</a></li>
            <li><a href="/messages">Messages</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="avatar-wrapper" onClick={() => navigate("/account")} style={{ cursor: 'pointer' }}>
            <ProfileAvatar profile={profile} />
          </div>
          <h1>Welcome, {profile?.company_name || 'User'}</h1>
        </div>

        <div className="dashboard-cards">
          <Card><CardContent><h2>Pending Requests</h2><p>{stats?.pending_requests ?? '--'}</p></CardContent></Card>
          <Card><CardContent><h2>{userType === 'vendor' ? 'Approved Services' : 'Partner Deals'}</h2><p>{stats?.approved_services ?? stats?.partner_deals ?? '--'}</p></CardContent></Card>
          <Card><CardContent><h2>New Messages</h2><p>{stats?.unread_messages ?? '--'}</p></CardContent></Card>
        </div>

        <section className="chart-section">
          <h2>Activity Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="profile-summary">
          <h2>Your Profile</h2>
          <p><strong>Contact:</strong> {profile?.contact_person}</p>
          <p><strong>Phone:</strong> {profile?.phone}</p>
          <p><strong>Website:</strong> {profile?.website}</p>
          <p><strong>Address:</strong> {profile?.address}</p>
        </section>

        <section className="video-gallery">
          <h2>Your Videos</h2>
          {videos.length > 0 ? (
            <div className="video-scroll">
              {videos.map((vid) => (
                <div key={vid.id} className="video-card">
                  <video width="100%" height="200" controls preload="metadata">
                    <source src={vid.file} type="video/mp4" />
                    Your browser does not support video.
                  </video>
                  {vid.description && <p className="video-desc">{vid.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No videos uploaded yet.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default PartnerVendorDashboard;
