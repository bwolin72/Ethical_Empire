import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminDashboard from './AdminDashboard';
import BookingManagement from './BookingManagement';
import InvoiceGeneration from './InvoiceGeneration';
import MediaManagement from './MediaManagement';
import ReviewsManagement from './ReviewsManagement';
import NewsletterAdminPage from './NewsletterAdminPage';
import AdminPromotions from './AdminPromotions';
import UserRoleManager from './UserRoleManager';
import AnalyticsDashboard from './AnalyticsDashboard'; // ✅ Make sure this component exists

import useAuth from '../../hooks/useAuth';
import './AdminPanel.css';

const AdminPanel = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    setAuth({});
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </li>
          <li className={activeTab === 'booking' ? 'active' : ''} onClick={() => setActiveTab('booking')}>
            Booking Management
          </li>
          <li className={activeTab === 'invoice' ? 'active' : ''} onClick={() => setActiveTab('invoice')}>
            Invoice Generation
          </li>
          <li className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>
            Media Management
          </li>
          <li className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            Reviews
          </li>
          <li className={activeTab === 'newsletter' ? 'active' : ''} onClick={() => setActiveTab('newsletter')}>
            Newsletter Manager
          </li>
          <li className={activeTab === 'promotions' ? 'active' : ''} onClick={() => setActiveTab('promotions')}>
            Promotions Manager
          </li>
          <li className={activeTab === 'roles' ? 'active' : ''} onClick={() => setActiveTab('roles')}>
            User Role Manager
          </li>
          <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            Analytics
          </li>
          <li className="logout-tab" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </aside>

      <section className="admin-content">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'booking' && <BookingManagement />}
        {activeTab === 'invoice' && <InvoiceGeneration />}
        {activeTab === 'media' && <MediaManagement />}
        {activeTab === 'reviews' && <ReviewsManagement />}
        {activeTab === 'newsletter' && <NewsletterAdminPage />}
        {activeTab === 'promotions' && <AdminPromotions />}
        {activeTab === 'roles' && <UserRoleManager />}
        {activeTab === 'analytics' && <AnalyticsDashboard />} {/* ✅ Must create */}
      </section>
    </div>
  );
};

export default AdminPanel;
