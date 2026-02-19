import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../services/auth';

export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

