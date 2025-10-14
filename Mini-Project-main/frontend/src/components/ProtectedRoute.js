import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(user?.role)) {
      // Redirect based on user role
      if (user?.role === 'admin' || user?.role === 'staff') {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // Check if user is verified for sensitive operations
  if (!user?.isVerified && location.pathname !== '/profile') {
    // Allow access to application forms but show warning
    const sensitiveRoutes = ['/applications/new', '/grievances/new'];
    if (sensitiveRoutes.some(route => location.pathname.startsWith(route))) {
      // Show warning banner but allow access
      return (
        <div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Account verification required:</strong> You need to verify your account before submitting applications. 
                  <button 
                    onClick={() => window.location.href = '/profile'}
                    className="ml-2 underline hover:no-underline"
                  >
                    Verify now
                  </button>
                </p>
              </div>
            </div>
          </div>
          {children}
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
