import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";

/**
 * ProtectedRoute
 * A wrapper for routes that require authentication and optional role-based access.
 *
 * @param {Array} roles - Optional array of allowed user roles ['admin', 'user', 'vendor', 'partner']
 * @param {String} guestRedirect - Path to redirect if unauthenticated (default: /login)
 */
const ProtectedRoute = ({ roles = [], guestRedirect = "/login" }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const user = auth?.user || {};
  const userRole = (user?.role || "").toLowerCase();
  const allowedRoles = roles.map((r) => r.toLowerCase());

  console.log("[ProtectedRoute] Snapshot:", {
    loading,
    ready,
    isAuthenticated,
    user,
    allowedRoles,
  });

  // Wait until context is ready
  if (loading || !ready) {
    return <SplashScreen />;
  }

  // Not logged in
  if (!isAuthenticated) {
    console.warn(
      `[ProtectedRoute] Not authenticated. Redirecting to ${guestRedirect}`
    );
    return <Navigate to={guestRedirect} replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(
        `[ProtectedRoute] Access denied. Role "${userRole}" is not allowed.`
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed
  return <Outlet />;
};

export default ProtectedRoute;
