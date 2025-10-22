import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { roleRoutes } from "../../routes/roleRoutes";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

/**
 * 🔒 ProtectedRoute
 * Restricts access to authenticated users, with optional role-based control.
 */
const ProtectedRoute = ({ roles = [], guestRedirect = "/login" }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  const userRole = auth.user?.role?.toLowerCase() || null;
  const allowedRoles = roles.map((r) => r.toLowerCase());

  if (loading || !ready) return <SplashScreen />;

  // Unauthenticated user
  if (!isAuthenticated) {
    if (!toastShown.current) {
      toast.info("You must login to access this page.");
      toastShown.current = true;
    }

    let nextPath = location.pathname;
    // Ignore public routes for `next` redirect
    if (PUBLIC_ROUTES.includes(nextPath)) nextPath = "";

    const redirectPath = `${guestRedirect}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`;
    return <Navigate to={redirectPath} replace />;
  }

  // Role-based access
  if (allowedRoles.length && userRole && !allowedRoles.includes(userRole)) {
    if (!toastShown.current) {
      toast.warn("Access denied: insufficient permissions.");
      toastShown.current = true;
    }

    const dashboardPath = roleRoutes[userRole] ?? "/unauthorized";
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  guestRedirect: PropTypes.string,
};

export default ProtectedRoute;
