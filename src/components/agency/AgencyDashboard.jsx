import React, { useEffect, useState } from 'react';
import api from '../../api/api'; // your centralized api service
import { Card, CardContent } from '../ui/Card';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import ProfileAvatar from '../user/ProfileAvatar';
import Messaging from '../messaging/messaging'; // ✅ Import messaging
import './PartnerVendorDashboard.css';

const PartnerVendorDashboard = () => {
  const [userType, setUserType] = useState(null); // 'partner' or 'vendor'
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, messages

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await api.getUserRole();
        const role = (userRes.data.role || '').toLowerCase().trim();

        if (role !== 'vendor' && role !== 'partner') {
          toast.error('Access denied: not a vendor or partner');
          return navigate('/login');
        }
        setUserType(role);

        // profile
        const profileRes =
          role === 'vendor' ? await api.getVendorProfile() : await api.getPartnerProfile();
        setProfile(profileRes.data);

        // dashboard stats
        const statsRes =
          role === 'vendor'
            ? await api.getVendorDashboardStats()
            : await api.getPartnerDashboardStats();
        setStats(statsRes.data);

        // activity chart
        const chartRes =
          role === 'vendor'
            ? await api.getVendorActivityChart()
            : await api.getPartnerActivityChart();
        setChartData(chartRes.data);

        // videos
        const videosRes = await api.getVideos({ is_active: true });
        setVideos(videosRes.data?.results || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="dashboard-container">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <nav>
          <ul>
            <li
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </li>
            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Edit Profile
            </li>
            <li
              className={activeTab === 'messages' ? 'active' : ''}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </li>
            <li onClick={() => navigate('/logout')}>Logout</li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <>
            <div className="dashboard-header">
              <div
                className="avatar-wrapper"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                <ProfileAvatar profile={profile} />
              </div>
              <h1>Welcome, {profile?.company_name || profile?.agency_name || 'User'}</h1>
            </div>

            <div className="dashboard-cards">
              <Card>
                <CardContent>
                  <h2>Pending Requests</h2>
                  <p>{stats?.pending_requests ?? '--'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h2>{userType === 'vendor' ? 'Approved Services' : 'Partner Deals'}</h2>
                  <p>{stats?.approved_services ?? stats?.partner_deals ?? '--'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h2>New Messages</h2>
                  <p>{stats?.unread_messages ?? '--'}</p>
                </CardContent>
              </Card>
            </div>

            <section className="chart-section">
              <h2>Activity Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
              <p><strong>Contact:</strong> {profile?.contact_person || profile?.name || '--'}</p>
              <p><strong>Phone:</strong> {profile?.phone || '--'}</p>
              <p><strong>Website:</strong> {profile?.website || '--'}</p>
              <p><strong>Address:</strong> {profile?.address || '--'}</p>
            </section>

            <section className="video-gallery">
              <h2>Your Videos</h2>
              {videos.length > 0 ? (
                <div className="video-scroll">
                  {videos.map((vid) => (
                    <div key={vid.id} className="video-card">
                      <video width="100%" height="200" controls preload="metadata">
                        <source src={vid.file} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      {vid.description && <p className="video-desc">{vid.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No videos uploaded yet.</p>
              )}
            </section>
          </>
        )}

        {activeTab === 'profile' && (
          <section className="profile-edit">
            <h2>Edit Profile</h2>
            <ProfileAvatar profile={profile} />
            {/* Additional profile edit form can be inserted here */}
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="messages-tab">
            <h2>Messages</h2>
            <Messaging userType={userType} profile={profile} />
          </section>
        )}
      </main>
    </div>
  );
};

export default PartnerVendorDashboard;
