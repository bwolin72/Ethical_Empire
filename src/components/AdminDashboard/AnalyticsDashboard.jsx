// src/components/AdminDashboard/AnalyticsDashboard.jsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/analytics/stats/');
        setData(response.data);
      } catch (err) {
        console.error('[AnalyticsDashboard] Fetch error:', err);
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

  const {
    total_users = 0,
    total_bookings = 0,
    total_invoices = 0,
    total_revenue = 0,
    total_visits = 0,
    chart_data = [],
  } = data;

  const summaryData = [
    { name: 'Users', value: total_users },
    { name: 'Bookings', value: total_bookings },
    { name: 'Invoices', value: total_invoices },
    { name: 'Revenue', value: total_revenue },
    { name: 'Page Views', value: total_visits },
  ];

  return (
    <div className="admin-analytics-page">
      <h2>📊 Analytics Dashboard</h2>

      <div className="analytics-grid">
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Users</h3>
            <p>{total_users}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Bookings</h3>
            <p>{total_bookings}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Invoices</h3>
            <p>{total_invoices}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Revenue</h3>
            <p>₵ {total_revenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="analytics-card">
          <CardContent>
            <h3>Total Page Views</h3>
            <p>{total_visits}</p>
          </CardContent>
        </Card>
      </div>

      <div className="chart-container">
        <h4>📅 Visits in the Last 7 Days</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="visits" fill="#02807d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h4>📈 Summary Chart</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#6c5ce7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
