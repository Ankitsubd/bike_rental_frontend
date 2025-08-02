
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Spinner from './Spinner';

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <Spinner />;
  }

  // If no user logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin role if required
  if (role === 'admin') {
    // Check both user object and localStorage for admin role
    const isAdmin = user.is_staff || 
                   user.is_superuser || 
                   localStorage.getItem('role') === 'admin' || 
                   user.role === 'admin';
    
    if (!isAdmin) {
      console.log('User is not admin:', user);
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render nested routes
  return <Outlet />;
}

export default ProtectedRoute;
