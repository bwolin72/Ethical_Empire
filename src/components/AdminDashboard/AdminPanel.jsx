import React, { useEffect, useState } from 'react';

import AdminDashboard from './AdminDashboard';
import BookingManagement from './BookingManagement';
import InvoiceGeneration from './InvoiceGeneration';
import MediaManagement from './MediaManagement';
import ReviewsManagement from './ReviewsManagement';
import NewsletterAdminPage from './NewsletterAdminPage';
import AdminPromotions from './AdminPromotions';
import UserRoleManager from './UserRoleManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import VideoUpload from './VideoUpload';
import ServicesAdmin from './ServicesAdmin'; // ✅ NEW

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import AccountProfile from '../user/AccountProfile';

import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // 🔄 Always fetch fresh profile data when modal opens
  useEffect(() => {
    if (showProfile) {
      axiosInstance
        .get('/accounts/profiles/profile/')
        .then((res) => {
          setProfileData(res.data);
          setProfileError(null);
        })
        .catch((err) => {
          console.error('Failed to load profile', err);
          setProfileError('Could not load profile. Please try again later.');
        });
    }
  }, [showProfile]);

  // 🅰️ Generate initials from profile/user safely
  const getInitials = (profile, user) => {
    let name = profile?.name || user?.name || '';
    if (!name && user) {
      name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (!name) return '?';

    const parts = name.split(' ').filter(Boolean);
    return parts.length > 1
      ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <div
            className="admin-profile-icon"
            onClick={() => setShowProfile(true)}
          >
            {profileData?.profile_image ? (
              <img src={profileData.profile_image} alt="Profile" />
            ) : (
              <span>{getInitials(profileData, user)}</span>
            )}
          </div>
        </div>

        <ul>
          <li
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={activeTab === 'booking' ? 'active' : ''}
            onClick={() => setActiveTab('booking')}
          >
            Booking Management
          </li>
          <li
            className={activeTab === 'invoice' ? 'active' : ''}
            onClick={() => setActiveTab('invoice')}
          >
            Invoice Generation
          </li>
          <li
            className={activeTab === 'media' ? 'active' : ''}
            onClick={() => setActiveTab('media')}
          >
            Media Management
          </li>
          <li
            className={activeTab === 'video' ? 'active' : ''}
            onClick={() => setActiveTab('video')}
          >
            Video Upload
          </li>
          <li
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            Services Manager {/* ✅ NEW tab */}
          </li>
          <li
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </li>
          <li
            className={activeTab === 'newsletter' ? 'active' : ''}
            onClick={() => setActiveTab('newsletter')}
          >
            Newsletter Manager
          </li>
          <li
            className={activeTab === 'promotions' ? 'active' : ''}
            onClick={() => setActiveTab('promotions')}
          >
            Promotions Manager
          </li>
          <li
            className={activeTab === 'roles' ? 'active' : ''}
            onClick={() => setActiveTab('roles')}
          >
            User Role Manager
          </li>
          <li
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </li>
        </ul>
      </aside>

      <section className="admin-content">
        {activeTab === 'dashboard' && (
          <AdminDashboard setActiveTab={setActiveTab} />
        )}
        {activeTab === 'booking' && <BookingManagement />}
        {activeTab === 'invoice' && <InvoiceGeneration />}
        {activeTab === 'media' && <MediaManagement />}
        {activeTab === 'video' && <VideoUpload />}
        {activeTab === 'services' && <ServicesAdmin />}
        {activeTab === 'reviews' && <ReviewsManagement />}
        {activeTab === 'newsletter' && <NewsletterAdminPage />}
        {activeTab === 'promotions' && <AdminPromotions />}
        {activeTab === 'roles' && <UserRoleManager />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </section>

      {showProfile && (
        <div className="profile-modal">
          <div
            className="profile-overlay"
            onClick={() => setShowProfile(false)}
          ></div>
          <div className="profile-content">
            {profileError ? (
              <p className="error-message">{profileError}</p>
            ) : (
              <AccountProfile profile={profileData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
