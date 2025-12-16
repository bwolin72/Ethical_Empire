// src/App.js
import React, { useEffect, useState, useCallback } from "react";
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
import CookiesPolicy from "./components/legal/CookiesPolicy"; // New import

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
// Scroll Management Component
// ==============================
const ScrollManager = () => {
  const location = useLocation();
  const prevPathname = React.useRef(location.pathname);

  useEffect(() => {
    // Always scroll to top on route change
    window.scrollTo({ top: 0, behavior: "instant" });
    
    // Dispatch route change event for other components
    window.dispatchEvent(new Event("route-change"));
    
    // Store current pathname for comparison
    prevPathname.current = location.pathname;
    
    // Handle scroll restoration on page reload
    if (performance.navigation?.type === 1) { // TYPE_RELOAD
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return null;
};

// ==============================
// Error Toast Handler
// ==============================
const showErrorToast = (error) => {
  let message = "An unexpected error occurred";
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.response?.data?.error) {
    message = error.response.data.error;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }
  
  // Don't show toast for cancelled requests or network errors
  if (error?.code === "ERR_CANCELED" || error?.message === "Network Error") {
    return;
  }
  
  toast.error(`❌ ${message}`, {
    toastId: `error-${Date.now()}`,
    autoClose: 5000,
  });
};

// ==============================
// Query Client Configuration
// ==============================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      onError: showErrorToast,
    },
    mutations: {
      retry: 0,
      onError: showErrorToast,
    },
  },
});

// ==============================
// Homepage Component
// ==============================
const EethmHomePage = () => {
  const navigate = useNavigate();
  
  const handleBookingClick = useCallback(() => {
    toast.info("Please login or create an account to continue booking.");
    navigate("/login");
  }, [navigate]);

  return (
    <div className="home-page">
      <EethmHome />
      <div className="home-page-booking-toggle">
        <button 
          className="home-page-booking-button" 
          onClick={handleBookingClick}
          aria-label="Create a booking"
        >
          Create Booking
        </button>
      </div>
    </div>
  );
};

// ==============================
// Role-Based Routes Configuration
// ==============================
export const roleRoutes = {
  admin: "/admin",
  worker: "/worker-dashboard",
  user: "/user",
  client: "/user",
  vendor: "/partner-vendor-dashboard",
  partner: "/partner-vendor-dashboard",
};

// ==============================
// App Routes Component
// ==============================
const AppRoutes = React.memo(() => {
  const location = useLocation();
  
  // Prevent unnecessary re-renders
  return (
    <Routes location={location} key={location.pathname}>
      {/* Public Routes */}
      <Route path="/" element={<EethmHomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/general" element={<GeneralServicesPage />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/cookies" element={<CookiesPolicy />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/flipbook" element={<FlipbookViewer />} />
      <Route path="/social" element={<SocialHub />} />

      {/* Blog */}
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />

      {/* Messaging / Social */}
      <Route path="/messaging" element={<Messaging />} />
      <Route path="/connect" element={<ConnectHub />} />

      {/* Services */}
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password-confirm/:uid/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/login/callback" element={<OAuthLoginRedirect />} />

      {/* Protected Routes - User & Admin */}
      <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
        <Route path="/user" element={<UserPage />} />
        <Route path="/account" element={<AccountProfile />} />
        <Route path="/bookings" element={<BookingForm />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/confirm-password-change" element={<ConfirmPasswordChange />} />
        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      </Route>

      {/* Protected Routes - Vendor */}
      <Route element={<ProtectedRoute roles={["vendor"]} />}>
        <Route path="/vendor-profile" element={<VendorProfile />} />
      </Route>

      {/* Protected Routes - Partner */}
      <Route element={<ProtectedRoute roles={["partner"]} />}>
        <Route path="/partner-profile" element={<PartnerProfilePage />} />
        <Route path="/partner-dashboard" element={<AgencyDashboard />} />
      </Route>

      {/* Protected Routes - Worker */}
      <Route element={<ProtectedRoute roles={["worker"]} />}>
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
      </Route>

      {/* Protected Routes - Admin */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
});

AppRoutes.displayName = "AppRoutes";

// ==============================
// App Layout with Splash Screen
// ==============================
const AppWithSplash = () => {
  const [splashVisible, setSplashVisible] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark hydration as complete
    setIsHydrated(true);
    
    // Set scroll restoration to manual
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    
    // Handle splash screen
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 1500); // Reduced from 2000ms for better UX

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  // Show splash screen until hydrated
  if (!isHydrated || splashVisible) {
    return <SplashScreen onFinish={() => setSplashVisible(false)} />;
  }

  return (
    <div className="App">
      <Navbar />
      <ScrollManager />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
      <PromotionPopup />
      <FloatingWhatsAppButton />
      <FloatingSocialHubButton />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </div>
  );
};

// ==============================
// Root App Component
// ==============================
function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn("Google OAuth Client ID is not configured. Google authentication will not work.");
  }

  return (
    <React.StrictMode>
      <GoogleOAuthProvider clientId={googleClientId || ""}>
        <QueryClientProvider client={queryClient}>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AuthProvider>
              <ProfileProvider>
                <AppWithSplash />
              </ProfileProvider>
              {process.env.NODE_ENV === "development" && <DebugWrapper />}
            </AuthProvider>
          </Router>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}

export default App;
