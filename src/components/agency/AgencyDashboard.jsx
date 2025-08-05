import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Card, CardContent } from '../ui/Card';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './PartnerVendorDashboard.css';

const PartnerVendorDashboard = () => {
  const [userType, setUserType] = useState(null); // 'partner' or 'vendor'
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await axiosInstance.get('/accounts/user-type/');
        const type = userRes.data.type;
        setUserType(type);

        const profileRes = await axiosInstance.get(`/accounts/${type}-profile/`);
        const statsRes = await axiosInstance.get(`/${type}s/dashboard-stats/`);
        const chartRes = await axiosInstance.get(`/${type}s/activity-chart/`);

        setProfile(profileRes.data);
        setStats(statsRes.data);
        setChartData(chartRes.data);
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
            <li><a href={`/${userType}-profile/edit`}>Edit Profile</a></li>
            <li><a href="/messages">Messages</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </nav>
      </aside>

      <main className="dashboard-main">
        <h1>Welcome, {profile?.company_name || 'User'}</h1>

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
      </main>
    </div>
  );
};

export default PartnerVendorDashboard;
