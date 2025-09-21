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
import api from '../../api/services/analyticsService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.stats();   // ✅ use service directly
        setData(res?.data ?? {});
      } catch (err) {
        console.error('[AnalyticsDashboard] Fetch error:', err);
        setError(
          err.response?.status === 401
            ? 'You are not authorized to view this dashboard.'
            : 'Failed to fetch analytics data.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="analytics-loading">🔄 Loading analytics...</div>;
  if (error) return <div className="analytics-error">⚠️ {error}</div>;

  const {
    total_users = 0,
    total_bookings = 0,
    total_invoices = 0,
    total_revenue = 0,
    total_visits = 0,
    chart_data = [],
  } = data ?? {};

  const summaryData = [
    { name: 'Users', value: total_users },
    { name: 'Bookings', value: total_bookings },
    { name: 'Invoices', value: total_invoices },
    { name: 'Revenue', value: total_revenue },
    { name: 'Page Views', value: total_visits },
  ];

  const validChartData = Array.isArray(chart_data)
    ? chart_data.filter(entry => entry?.date && typeof entry?.visits === 'number')
    : [];

  return (
    <div className="admin-analytics-page">
      <h2>📊 Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="analytics-grid">
        {summaryData.map(({ name, value }) => (
          <Card key={name} className="analytics-card">
            <CardContent>
              <h3>Total {name}</h3>
              <p>{name === 'Revenue' ? `₵ ${Number(value).toFixed(2)}` : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart: Visits in last 7 days */}
      <div className="chart-container">
        <h4>📅 Visits in the Last 7 Days</h4>
        {validChartData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={validChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="visits" fill="#02807d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No recent visit data available.</p>
        )}
      </div>

      {/* Chart: Summary Overview */}
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
