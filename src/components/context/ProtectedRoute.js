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

  // Wait until AuthContext is ready
  if (loading || !ready) return <SplashScreen />;

  // Redirect if not authenticated
  if (!isAuthenticated) return <Navigate to={guestRedirect} replace />;

  // Role-based access control
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
