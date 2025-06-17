import React, { useState } from 'react';
import './AdminPanel.css';
import AdminDashboard from './AdminDashboard';
import BookingManagement from './BookingManagement';
import VideosManagement from './VideosManagement';
import InvoiceGeneration from './InvoiceGeneration';
import MediaManagement from './MediaManagement';
import ReviewsManagement from './ReviewsManagement';
import NewsletterAdminPage from './NewsletterAdminPage';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <h1>EETHM GH ADMIN VIEW</h1>
        <div className="admin-address">
          CITY: GOMOA AKOTSI<br />
          DISTRICT: GOMOA EAST DISTRICT<br />
          REGION: CENTRAL REGION<br />
          GPS ADDRESS: CG-1556-4893
        </div>
      </header>

      <div className="admin-main">
        <aside className="admin-sidebar">
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
              className={activeTab === 'video' ? 'active' : ''}
              onClick={() => setActiveTab('video')}
            >
              Video Management
            </li>
            <li
              className={activeTab === 'invoice' ? 'active' : ''}
              onClick={() => setActiveTab('invoice')}
            >
              Invoice Management
            </li>
            <li
              className={activeTab === 'media' ? 'active' : ''}
              onClick={() => setActiveTab('media')}
            >
              Media Management
            </li>
            <li
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews Management
            </li>
            <li
              className={activeTab === 'newsletter' ? 'active' : ''}
              onClick={() => setActiveTab('newsletter')}
            >
              Newsletter Manager
            </li>
            <li className="logout-tab" onClick={handleLogout}>
              Logout
            </li>
          </ul>
        </aside>

        <section className="admin-content">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'booking' && <BookingManagement />}
          {activeTab === 'video' && <VideosManagement />}
          {activeTab === 'invoice' && <InvoiceGeneration />}
          {activeTab === 'media' && <MediaManagement />}
          {activeTab === 'reviews' && <ReviewsManagement />}
          {activeTab === 'newsletter' && <NewsletterAdminPage />}
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
