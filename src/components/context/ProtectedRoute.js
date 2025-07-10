import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * ProtectedRoute
 * @param {Array} roles - Array of allowed user roles ['admin', 'user', ...]
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading, ready } = useAuth();
  const userRole = auth?.user?.role;

  // Show loading indicator until auth state is ready
  if (loading || !ready) {
    return <div className="protected-loading">Loading...</div>;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    console.warn('ProtectedRoute: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Role not authorized
  if (roles.length && !roles.includes(userRole)) {
    console.warn(`ProtectedRoute: Access denied for role: ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default ProtectedRoute;
