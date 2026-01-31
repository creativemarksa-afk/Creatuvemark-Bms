"use client";
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for protecting routes with authentication
 * @param {string[]} allowedRoles - Array of allowed user roles (optional)
 * @param {boolean} redirectOnFail - Whether to redirect on authentication failure (default: true)
 * @returns {boolean} - Whether the user is authenticated and authorized
 */
export const useAuthGuard = (allowedRoles = [], redirectOnFail = true) => {
  const { user, loading, requireAuth } = useAuth();

  useEffect(() => {
    // Don't check authentication while still loading
    if (loading) return;

    // Check authentication and authorization
    if (redirectOnFail) {
      requireAuth(allowedRoles);
    }
  }, [user, loading, allowedRoles, redirectOnFail, requireAuth]);

  // Return authentication status
  if (loading) return false;
  if (!user) return false;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return false;
  
  return true;
};

export default useAuthGuard;
