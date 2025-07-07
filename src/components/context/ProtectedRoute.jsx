// src/components/routing/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading } = useAuth();

  // While session is loading (from localStorage or refresh), block route
  if (loading) return <div className="protected-loading">Loading...</div>;

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('ProtectedRoute: Not authenticated, redirecting to /login');
    }
    return <Navigate to="/login" replace />;
  }

  const userRole = auth?.user?.role;

  // If route is restricted to certain roles and user's role is not allowed
  if (roles.length > 0 && !roles.includes(userRole)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`ProtectedRoute: Role "${userRole}" not allowed`, roles);
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is fine, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
