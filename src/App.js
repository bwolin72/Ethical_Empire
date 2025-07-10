import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';

import './App.css';

// Layout & UI
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import SplashScreen from './components/ui/SplashScreen';
import PromotionPopup from './components/home/PromotionPopup';

// Pages - Home & Static
import EethmHome from './components/home/EethmHome';
import About from './components/home/About';
import Services from './components/home/Services';
import ContactForm from './components/Queries/ContactForm';

// Pages - Auth & Profile
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyOTP from './components/Auth/VerifyOTP';
import EditProfile from './components/user/EditProfile';
import UpdatePassword from './components/user/UpdatePassword';
import ConfirmPasswordChange from './components/user/ConfirmPasswordChange';
import AccountProfile from './components/user/AccountProfile';

// Pages - Dashboard & Forms
import AdminPanel from './components/AdminDashboard/AdminPanel';
import UserPage from './components/user/UserPage';
import BookingForm from './components/Queries/BookingForm';
import NewsletterSignup from './components/user/NewsLetterSignup';
import Unsubscribe from './components/user/UnsubscribePage';

// Pages - Services
import LiveBandServicePage from './components/services/LiveBandServicePage';
import CateringServicePage from './components/services/CateringServicePage';
import DecorServicePage from './components/services/DecorServicePage';
import MediaHostingServicePage from './components/services/MediaHostingServicePage';

// Context & Auth
import { AuthProvider, useAuth } from './components/context/AuthContext';
import axiosCommon from './api/axiosCommon';

// Route Guard
import ProtectedRoute from './components/context/ProtectedRoute';

// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';

// ==============================
// Homepage with Booking Button
// ==============================
const EethmHomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate(auth?.access ? '/bookings' : '/login');
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

// ==============================
// Role-Based Redirect Handler
// ==============================
const ConnectRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkUserRole = async () => {
      try {
        const res = await axiosCommon.get('/accounts/user-role/');
        if (!isMounted) return;

        const isAdmin = res?.data?.is_admin?.toString() === 'true';
        navigate(isAdmin ? '/admin' : '/user', { replace: true });
      } catch {
        if (isMounted) navigate('/login', { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkUserRole();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return loading ? <div className="loading-screen">Redirecting...</div> : null;
};

// ==============================
// App Routes Definition
// ==============================
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<EethmHomePage />} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact" element={<ContactForm />} />
    <Route path="/services/live-band" element={<LiveBandServicePage />} />
    <Route path="/services/catering" element={<CateringServicePage />} />
    <Route path="/services/decor" element={<DecorServicePage />} />
    <Route path="/services/media-hosting" element={<MediaHostingServicePage />} />
    <Route path="/newsletter" element={<NewsletterSignup />} />
    <Route path="/unsubscribe" element={<Unsubscribe />} />

    {/* Auth Routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password-confirm/:uid/:token" element={<ResetPassword />} />
    <Route path="/connect" element={<ConnectRedirect />} />

    {/* Protected User/Admin Routes */}
    <Route element={<ProtectedRoute roles={['user', 'admin']} />}>
      <Route path="/user" element={<UserPage />} />
      <Route path="/account" element={<AccountProfile />} />
      <Route path="/bookings" element={<BookingForm />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/confirm-password-change" element={<ConfirmPasswordChange />} />
    </Route>

    {/* Protected Admin Route */}
    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="/admin" element={<AdminPanel />} />
    </Route>

    {/* Unauthorized Access */}
    <Route path="/unauthorized" element={<div className="unauthorized">Access Denied</div>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// ==============================
// App With Splash Screen & Auth
// ==============================
const AppWithAuth = () => {
  const { loading, ready } = useAuth();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  if (!ready || loading || splashVisible) {
    return <SplashScreen onFinish={() => setSplashVisible(false)} />;
  }

  return (
    <div className="App">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      <Footer />
      <PromotionPopup />
    </div>
  );
};

// ==============================
// Root App Component
// ==============================
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
