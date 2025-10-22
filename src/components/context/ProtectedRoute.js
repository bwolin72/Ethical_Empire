import React, { useEffect, useRef } from "react";
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
 * @param {string} guestRedirect - Redirect path for unauthenticated users (default: "/login")
 */
const ProtectedRoute = ({ roles = [], guestRedirect = "/login" }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  // Normalize role and allowed roles
  const userRole = auth.user?.role ? auth.user.role.toLowerCase() : null;
  const allowedRoles = roles.map((r) => r.toLowerCase());

  // --------------------------
  // Wait for AuthContext to be ready
  // --------------------------
  if (loading || !ready) {
    return <SplashScreen />;
  }

  // --------------------------
  // Handle unauthenticated users
  // --------------------------
  if (!isAuthenticated && ready) {
    if (!toastShown.current) {
      toast.info("You must login to access this page.");
      toastShown.current = true;
    }

    const redirectPath = `${guestRedirect}?next=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectPath} replace />;
  }

  // --------------------------
  // Handle role-based access control
  // --------------------------
  if (allowedRoles.length && userRole && !allowedRoles.includes(userRole)) {
    if (!toastShown.current) {
      toast.warn("Access denied: insufficient permissions.");
      toastShown.current = true;
    }

    const dashboardPath = roleRoutes[userRole] ?? "/unauthorized";
    return <Navigate to={dashboardPath} replace />;
  }

  // --------------------------
  // ✅ All checks passed — render nested routes
  // --------------------------
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  guestRedirect: PropTypes.string,
};

export default ProtectedRoute;
