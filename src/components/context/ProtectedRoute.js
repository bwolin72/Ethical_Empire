import React, { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { roleRoutes } from "../../routes/roleRoutes";

/**
 * 🔒 ProtectedRoute
 * Restricts access to authenticated users, with optional role-based control.
 *
 * @param {Array<string>} roles - Allowed roles (e.g. ['admin', 'user', 'vendor', 'partner'])
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  // User role in lowercase
  const userRole = (auth?.user?.role || "").toLowerCase();
  const allowedRoles = roles.map((r) => r.toLowerCase());

  // Wait for auth context to initialize
  if (loading || !ready) return <SplashScreen />;

  // Unauthenticated → redirect to login
  if (!isAuthenticated) {
    if (!toastShown.current) {
      toast.info("Please login to continue.");
      toastShown.current = true;
    }
    const redirectPath = `/login?next=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectPath} replace />;
  }

  // Role-based restriction
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    if (!toastShown.current) {
      toast.warn("Access denied: insufficient permissions.");
      toastShown.current = true;
    }
    const dashboardPath = roleRoutes[userRole] || "/unauthorized";
    return <Navigate to={dashboardPath} replace />;
  }

  // All checks passed → render nested routes
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
