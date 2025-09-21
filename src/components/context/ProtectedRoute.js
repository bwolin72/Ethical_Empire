import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";

/**
 * ProtectedRoute
 * Ensures routes are accessible only by authenticated users,
 * with optional role-based access control.
 *
 * @param {Array} roles - Array of allowed roles, e.g., ['admin', 'user', 'vendor', 'partner']
 * @param {String} guestRedirect - Path to redirect if not authenticated (default: "/login")
 */
const ProtectedRoute = ({ roles = [], guestRedirect = "/login" }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const userRole = (auth?.user?.role || "").toLowerCase();
  const allowedRoles = roles.map((r) => r.toLowerCase());

  // Debug snapshot
  console.log("[ProtectedRoute] Snapshot:", {
    loading,
    ready,
    isAuthenticated,
    userRole,
    allowedRoles,
  });

  // Wait until AuthContext is ready
  if (loading || !ready) return <SplashScreen />;

  // User not authenticated
  if (!isAuthenticated) {
    console.warn(`[ProtectedRoute] Not authenticated. Redirecting to ${guestRedirect}`);
    return <Navigate to={guestRedirect} replace />;
  }

  // Role-based access control
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    console.warn(`[ProtectedRoute] Access denied. Role "${userRole}" is not allowed.`);
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render nested route
  return <Outlet />;
};

export default ProtectedRoute;
