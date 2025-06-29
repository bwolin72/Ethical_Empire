import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import './App.css';

// Core Layout Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import SplashScreen from './components/ui/SplashScreen';

// Home & Static
import EethmHome from './components/home/EethmHome';
import About from './components/home/About';
import Services from './components/home/Services';
import ContactForm from './components/Queries/ContactForm';

// Auth & Profile
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import EditProfile from './components/user/EditProfile';
import UpdatePassword from './components/user/UpdatePassword';
import ConfirmPasswordChange from './components/user/ConfirmPasswordChange';
import AccountProfile from './components/user/AccountProfile';

// Dashboard & Forms
import AdminPanel from './components/AdminDashboard/AdminPanel';
import UserPage from './components/user/UserPage';
import BookingForm from './components/Queries/BookingForm';
import NewsletterSignup from './components/user/NewsLetterSignup';
import Unsubscribe from './components/user/UnsubscribePage';

// Service Pages
import LiveBandServicePage from './components/services/LiveBandServicePage';
import CateringServicePage from './components/services/CateringServicePage';
import DecorServicePage from './components/services/DecorServicePage';
import MediaHostingServicePage from './components/services/MediaHostingServicePage';

// Context & Axios
import { AuthProvider, useAuth } from './components/context/AuthContext';
import axiosInstance from './api/axiosInstance';

// Google OAuth Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

// Promotion Popup
import PromotionPopup from './components/home/PromotionPopup'; // ✅ NEW

const HomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleBookingClick = () => {
    if (!auth?.access) {
      navigate('/login');
    } else {
      navigate('/bookings');
    }
  };

  return (
    <div className="home-page">
      <EethmHome />
      <div className="booking-toggle">
        <button className="booking-button" onClick={handleBookingClick}>
          Create Booking
        </button>
      </div>
    </div>
  );
};

const ConnectRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await axiosInstance.get('/api/accounts/user-role/');
        const isAdmin = res.data.is_admin === true || res.data.is_admin === 'true';
        navigate(isAdmin ? '/admin' : '/user', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    checkUserRole();
  }, [navigate]);

  if (loading) return <div className="loading-screen">Redirecting...</div>;
  return null;
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { auth } = useAuth();

  if (!auth?.access) return <Navigate to="/login" replace />;
  if (adminOnly && !auth?.isAdmin) return <Navigate to="/user" replace />;

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password-confirm/:uid/:token" element={<ResetPassword />} />
    <Route path="/user" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
    <Route path="/account" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
    <Route path="/bookings" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
    <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
    <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
    <Route path="/confirm-password-change" element={<ProtectedRoute><ConfirmPasswordChange /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPanel /></ProtectedRoute>} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact" element={<ContactForm />} />
    <Route path="/services/live-band" element={<LiveBandServicePage />} />
    <Route path="/services/catering" element={<CateringServicePage />} />
    <Route path="/services/decor" element={<DecorServicePage />} />
    <Route path="/services/media-hosting" element={<MediaHostingServicePage />} />
    <Route path="/newsletter" element={<NewsletterSignup />} />
    <Route path="/unsubscribe" element={<Unsubscribe />} />
    <Route path="/connect" element={<ConnectRedirect />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          {splashVisible ? (
            <SplashScreen onFinish={() => setSplashVisible(false)} />
          ) : (
            <div className="App">
              <Navbar />
              <main>
                <AppRoutes />
              </main>
              <Footer />
              <PromotionPopup /> {/* ✅ NEW: Promotion popup shown globally */}
            </div>
          )}
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
