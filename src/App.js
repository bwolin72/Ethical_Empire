// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";

import "./components/styles/variables.css";
import "./pdfjs-setup";

// Layout
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import SplashScreen from "./components/ui/SplashScreen";
import PromotionPopup from "./components/home/PromotionPopup";
import FloatingWhatsAppButton from "./components/ui/FloatingWhatsAppButton";
import FloatingSocialHubButton from "./components/ui/FloatingSocialHubButton";

// Pages - Public
import EethmHome from "./components/home/EethmHome";
import About from "./components/home/About";
import ContactForm from "./components/Queries/ContactForm";
import Terms from "./components/legal/Terms";
import Privacy from "./components/legal/Privacy";
import FAQ from "./components/legal/FAQ";
import FlipbookViewer from "./components/company/FlipbookViewer";

// Auth & Profile
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import VerifyOTP from "./components/Auth/VerifyOTP";
import EditProfile from "./components/user/EditProfile";
import UpdatePassword from "./components/user/UpdatePassword";
import ConfirmPasswordChange from "./components/user/ConfirmPasswordChange";
import AccountProfile from "./components/user/AccountProfile";
import OAuthLoginRedirect from "./components/Auth/OAuthLoginRedirect";
import VerifyEmail from "./components/Auth/VerifyEmail";

// Dashboards & Forms
import AdminPanel from "./components/AdminDashboard/AdminPanel";
import UserPage from "./components/user/UserPage";
import BookingForm from "./components/Queries/BookingForm";
import NewsletterSignup from "./components/user/NewsLetterSignup";
import Unsubscribe from "./components/user/UnsubscribePage";
import VendorProfile from "./components/agency/VendorProfile";
import PartnerProfilePage from "./components/agency/PartnerProfilePage";
import AgencyDashboard from "./components/agency/AgencyDashboard";
import WorkerDashboard from "./components/worker/WorkerDashboard";

// Services
import Services from "./components/services/Services";
import GeneralServicesPage from "./components/services/GeneralServicesPage";
import LiveBandServicePage from "./components/services/LiveBandServicePage";
import CateringServicePage from "./components/services/CateringServicePage";
import DecorServicePage from "./components/services/DecorServicePage";
import MediaHostingServicePage from "./components/services/MediaHostingServicePage";

// Blog, Messaging & Social
import { BlogList, BlogDetail } from "./components/blog/Blog";
import Messaging from "./components/messaging/messaging";
import ConnectHub from "./components/social/ConnectHub";
import SocialHub from "./components/social/SocialHub";

// Common
import Unauthorized from "./components/common/Unauthorized";
import NotFound from "./components/common/NotFound";

// Context & Utilities
import { AuthProvider } from "./components/context/AuthContext";
import { ProfileProvider } from "./components/context/ProfileContext";
import ProtectedRoute from "./components/context/ProtectedRoute";
import DebugWrapper from "./components/debug/DebugWrapper";

// ==============================
// Scroll Reset on Route Change
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
// Error Helper for Toast
// ==============================
const showErrorToast = (error) => {
  let message = "An unexpected error occurred";
  if (error?.response?.data?.message) message = error.response.data.message;
  else if (error?.message) message = error.message;
  toast.error(`❌ ${message}`);
};

// ==============================
// Homepage Wrapper
// ==============================
const EethmHomePage = () => {
  const navigate = useNavigate();
  const handleBookingClick = () => {
    toast.info("Please login or create an account to continue booking.");
    navigate("/login");
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
// Role Routes Mapping
// ==============================
export const roleRoutes = {
  admin: "/admin",
  worker: "/worker-dashboard",
  user: "/user",
  client: "/user", // alias for standard users
  vendor: "/partner-vendor-dashboard",
  partner: "/partner-vendor-dashboard",
};

// ==============================
// App Routes
// ==============================
const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes key={location.pathname}>
      {/* Public */}
      <Route path="/" element={<EethmHomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/general" element={<GeneralServicesPage />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/flipbook" element={<FlipbookViewer />} />
      <Route path="/social" element={<SocialHub />} />

      {/* Blog */}
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />

      {/* Messaging / Social */}
      <Route path="/messaging" element={<Messaging />} />
      <Route path="/connect" element={<ConnectHub />} />

      {/* Service Pages */}
      <Route path="/services/live-band" element={<LiveBandServicePage />} />
      <Route path="/services/catering" element={<CateringServicePage />} />
      <Route path="/services/decor" element={<DecorServicePage />} />
      <Route path="/services/media-hosting" element={<MediaHostingServicePage />} />

      {/* Newsletter */}
      <Route path="/newsletter" element={<NewsletterSignup />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> {/* request email */}
      <Route path="/reset-password-confirm/:uid/:token" element={<ResetPassword />} /> {/* confirm password */}
      <Route path="/verify-email" element={<VerifyEmail />} />


      {/* OAuth Callback */}
      <Route path="/login/callback" element={<OAuthLoginRedirect />} />

      {/* Protected: Users & Admins */}
      <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
        <Route path="/user" element={<UserPage />} />
        <Route path="/account" element={<AccountProfile />} />
        <Route path="/bookings" element={<BookingForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/confirm-password-change" element={<ConfirmPasswordChange />} />
        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      </Route>

      {/* Vendors */}
      <Route element={<ProtectedRoute roles={["vendor"]} />}>
        <Route path="/vendor-profile" element={<VendorProfile />} />
      </Route>

      {/* Partners */}
      <Route element={<ProtectedRoute roles={["partner"]} />}>
        <Route path="/partner-profile" element={<PartnerProfilePage />} />
        <Route path="/partner-dashboard" element={<AgencyDashboard />} />
      </Route>

      {/* Workers */}
      <Route element={<ProtectedRoute roles={["worker"]} />}>
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Unauthorized / Catch-all */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ==============================
// App With Splash & Layout
// ==============================
const AppWithSplash = () => {
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (splashVisible) return <SplashScreen onFinish={() => setSplashVisible(false)} />;

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
      <FloatingSocialHubButton />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

// ==============================
// Root App
// ==============================
function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60,
        onError: showErrorToast,
      },
      mutations: {
        retry: false,
        onError: showErrorToast,
      },
    },
  });

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ProfileProvider>
              <AppWithSplash />
            </ProfileProvider>
            <DebugWrapper />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
