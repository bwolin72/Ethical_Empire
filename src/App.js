// src/App.js
import React, { useEffect, useState } from "react";
import "./components/styles/variables.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

// Layout & UI
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import SplashScreen from "./components/ui/SplashScreen";
import PromotionPopup from "./components/home/PromotionPopup";
import FloatingWhatsAppButton from "./components/ui/FloatingWhatsAppButton";

// Pages - Home & Static
import EethmHome from "./components/home/EethmHome";
import About from "./components/home/About";
import Services from "./components/home/Services";
import ContactForm from "./components/Queries/ContactForm";

// Legal Pages
import Terms from "./components/legal/Terms";
import Privacy from "./components/legal/Privacy";

// Pages - Auth & Profile
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import VerifyOTP from "./components/Auth/VerifyOTP";
import EditProfile from "./components/user/EditProfile";
import UpdatePassword from "./components/user/UpdatePassword";
import ConfirmPasswordChange from "./components/user/ConfirmPasswordChange";
import AccountProfile from "./components/user/AccountProfile";
import AgencyDashboard from "./components/agency/AgencyDashboard";

// Pages - Dashboard & Forms
import AdminPanel from "./components/AdminDashboard/AdminPanel";
import UserPage from "./components/user/UserPage";
import BookingForm from "./components/Queries/BookingForm";
import NewsletterSignup from "./components/user/NewsLetterSignup";
import Unsubscribe from "./components/user/UnsubscribePage";
import VendorProfile from "./components/agency/VendorProfile";
import PartnerProfilePage from "./components/agency/PartnerProfilePage";
import PartnerDashboard from "./components/agency/PartnerDashboard";
import WorkerDashboard from "./components/worker/WorkerDashboard";

// Pages - Services
import LiveBandServicePage from "./components/services/LiveBandServicePage";
import CateringServicePage from "./components/services/CateringServicePage";
import DecorServicePage from "./components/services/DecorServicePage";
import MediaHostingServicePage from "./components/services/MediaHostingServicePage";

// Context & Auth
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./components/context/ProtectedRoute";

// Google OAuth
import { GoogleOAuthProvider } from "@react-oauth/google";

// Auth Service
import authService from "./api/services/authService";


// ==============================
// Homepage with Booking Button
// ==============================
const EethmHomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate(auth?.access ? "/bookings" : "/login");
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
        const res = await authService.getProfile();
        if (!isMounted) return;

        const role = res?.data?.role?.trim()?.toLowerCase();
        console.log("[ConnectRedirect] Redirecting based on role:", role);

        switch (role) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "user":
            navigate("/user", { replace: true });
            break;
          case "vendor":
            navigate("/vendor-profile", { replace: true });
            break;
          case "partner":
            navigate("/partner-dashboard", { replace: true });
            break;
          case "worker":
            navigate("/worker-dashboard", { replace: true });
            break;
          default:
            console.warn("[ConnectRedirect] Unknown role:", role);
            navigate("/unauthorized", { replace: true });
        }
      } catch (err) {
        console.error("Failed to determine role:", err);
        if (isMounted) navigate("/login", { replace: true });
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
// Auto Scroll + Refresh on Navigation
// ==============================
const ScrollAndRefresh = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("route-change"));
  }, [location]);

  return null;
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
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />

    {/* Service Pages */}
    <Route path="/services/live-band" element={<LiveBandServicePage />} />
    <Route path="/services/catering" element={<CateringServicePage />} />
    <Route path="/services/decor" element={<DecorServicePage />} />
    <Route path="/services/media-hosting" element={<MediaHostingServicePage />} />

    {/* Newsletter */}
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
    <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
      <Route path="/user" element={<UserPage />} />
      <Route path="/account" element={<AccountProfile />} />
      <Route path="/bookings" element={<BookingForm />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/confirm-password-change" element={<ConfirmPasswordChange />} />
      <Route path="/agency-dashboard" element={<AgencyDashboard />} />
    </Route>

    {/* Vendor */}
    <Route element={<ProtectedRoute roles={["vendor"]} />}>
      <Route path="/vendor-profile" element={<VendorProfile />} />
    </Route>

    {/* Partner */}
    <Route element={<ProtectedRoute roles={["partner"]} />}>
      <Route path="/partner-profile" element={<PartnerProfilePage />} />
      <Route path="/partner-dashboard" element={<AgencyDashboard />} />
    </Route>

    {/* Worker */}
    <Route element={<ProtectedRoute roles={["worker"]} />}>
      <Route path="/worker-dashboard" element={<WorkerDashboard />} />
    </Route>

    {/* Admin */}
    <Route element={<ProtectedRoute roles={["admin"]} />}>
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
      <ScrollAndRefresh />
      <main>
        <AppRoutes />
      </main>
      <Footer />
      <PromotionPopup />
      <FloatingWhatsAppButton />
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
