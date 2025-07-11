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
  const user = auth?.user;
  const userRole = user?.role;

  console.log('[ProtectedRoute] State snapshot:', {
    loading,
    ready,
    isAuthenticated,
    access: auth?.access,
    user,
    roles,
  });

  // Wait until auth context is initialized
  if (loading || !ready) {
    console.log('[ProtectedRoute] Waiting for auth context...');
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] Not authenticated. Redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  // If role-based restriction is applied
  if (roles.length > 0) {
    if (!userRole) {
      console.warn('[ProtectedRoute] No user role found. Redirecting to /unauthorized.');
      return <Navigate to="/unauthorized" replace />;
    }

    if (!roles.includes(userRole)) {
      console.warn(`[ProtectedRoute] Role "${userRole}" not in allowed roles:`, roles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('[ProtectedRoute] Access granted. Rendering protected route.');
  return <Outlet />;
};

export default ProtectedRoute;
