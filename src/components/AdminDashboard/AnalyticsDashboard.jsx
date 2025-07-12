// src/components/AdminDashboard/AnalyticsDashboard.jsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/analytics/');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!data) return null;

  const chartData = [
    { name: 'Users', value: data.total_users || 0 },
    { name: 'Bookings', value: data.total_bookings || 0 },
    { name: 'Invoices', value: data.total_invoices || 0 },
    { name: 'Revenue', value: data.total_revenue || 0 },
  ];

  return (
    <div className="admin-analytics-page">
      <h2>📊 Analytics Dashboard</h2>

      <div className="analytics-grid">
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Users</h3>
            <p>{data.total_users}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Bookings</h3>
            <p>{data.total_bookings}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Invoices</h3>
            <p>{data.total_invoices}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Revenue</h3>
            <p>₵ {data.total_revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="chart-container">
        <h4>Summary Chart</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#02807d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
