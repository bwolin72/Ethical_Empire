// src/components/context/ProtectedRoute.jsx
import React, { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { roleRoutes } from "../../routes/roleRoutes";

/**
 * 🔒 ProtectedRoute (Stable Version)
 * Restricts access to authenticated users with optional role control.
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const userRole = (auth?.user?.role || "").toLowerCase();
  const allowedRoles = roles.map((r) => r.toLowerCase());
  const location = useLocation();
  const toastShown = useRef(false);

  // 🕓 Wait until AuthContext fully initializes
  if (loading || !ready) return <SplashScreen />;

  // ❌ If user not authenticated → go to LOGIN only (never forgot-password)
  if (!isAuthenticated) {
    if (!toastShown.current) {
      toast.info("Please login to continue.");
      toastShown.current = true;
    }

    const redirectPath = `/login?next=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectPath} replace />;
  }

  // 🚫 Role restriction
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    if (!toastShown.current) {
      toast.warn("Access denied: insufficient permissions.");
      toastShown.current = true;
    }

    const dashboardPath = roleRoutes[userRole] || "/unauthorized";
    return <Navigate to={dashboardPath} replace />;
  }

  // ✅ All good → render the protected component
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
