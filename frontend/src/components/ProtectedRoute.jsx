import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/user-login" state={{ from: location }} replace />;
  }

  // Support both .role and .type for mock/demo users
  const userRole = (user?.role || user?.type || '').toUpperCase();

  // Strict required role
  if (requiredRole && userRole !== requiredRole.toUpperCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Multiple allowed roles
  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;