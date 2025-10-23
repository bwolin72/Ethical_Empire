// src/components/context/ProtectedRoute.jsx
import React, { useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SplashScreen from "../ui/SplashScreen";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { roleRoutes } from "../../routes/roleRoutes";

const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, auth, ready } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  const userRole = (auth?.user?.role || "").toLowerCase();
  const allowedRoles = roles.map((r) => r.toLowerCase());

  if (!ready) return <SplashScreen />;

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    if (!toastShown.current) {
      toast.info("Please login to continue.");
      toastShown.current = true;
    }
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Role mismatch → redirect to dashboard
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    if (!toastShown.current) {
      toast.warn("Access denied: insufficient permissions.");
      toastShown.current = true;
    }
    const dashboard = roleRoutes[userRole] || "/unauthorized";
    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
