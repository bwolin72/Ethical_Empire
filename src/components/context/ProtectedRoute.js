// src/context/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute
 * A wrapper for routes that require authentication and optional role-based access.
 *
 * @param {Array} roles - Optional array of allowed user roles ['admin', 'user', etc.]
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const userRole = auth?.user?.role;

  // Show loading indicator while auth state is initializing
  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.warn('ProtectedRoute: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Redirect to unauthorized page if user lacks required role
  if (roles.length && !roles.includes(userRole)) {
    console.warn(`ProtectedRoute: Access denied for role: ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
