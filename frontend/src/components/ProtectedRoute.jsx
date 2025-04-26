import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LiwanLoadingScreen from './ui/loadingscreen';
import SpinningScreen from './ui/spinningScreen';

export function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated, permissions, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SpinningScreen/>  ;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login-page" state={{ from: location }} replace />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

