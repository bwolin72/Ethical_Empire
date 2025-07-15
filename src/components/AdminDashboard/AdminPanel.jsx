import React, { useState } from 'react';

import AdminDashboard from './AdminDashboard';
import BookingManagement from './BookingManagement';
import InvoiceGeneration from './InvoiceGeneration';
import MediaManagement from './MediaManagement';
import ReviewsManagement from './ReviewsManagement';
import NewsletterAdminPage from './NewsletterAdminPage';
import AdminPromotions from './AdminPromotions';
import UserRoleManager from './UserRoleManager';
import AnalyticsDashboard from './AnalyticsDashboard';

import { useAuth } from '../context/AuthContext';
import { logoutHelper } from '../../utils/logoutHelper';

import './AdminPanel.css';

const AdminPanel = () => {
  const { setAccess, setRefresh, setUser, setIsAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    console.log('[AdminPanel] Logout clicked');

    try {
      // Optional: Make backend logout request here if needed
      // await axiosInstance.post('/accounts/logout/');
    } catch (err) {
      console.warn('[AdminPanel] Logout API failed:', err);
    } finally {
      // Reset auth context state
      setAccess(null);
      setRefresh(null);
      setUser(null);
      setIsAuthenticated(false);

      try {
        await logoutHelper(); // ✅ await async call to prevent crash
      } catch (e) {
        console.error('[AdminPanel] logoutHelper failed:', e);
        // Fallback redirect
        window.location.href = '/';
      }
    }
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
          <li className="logout-tab">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
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
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </section>
    </div>
  );
};

export default AdminPanel;
