// src/components/routing/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { auth, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="protected-loading">Loading...</div>;

  if (!isAuthenticated) {
    console.warn('ProtectedRoute: Not authenticated');
    return <Navigate to="/login" replace />;
  }

  const userRole = auth?.user?.role;
  if (roles?.length && !roles.includes(userRole)) {
    console.warn(`ProtectedRoute: Access denied for role: ${userRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
