"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, logout } from "../services/auth";
import Swal from "sweetalert2";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // Stores the current logged-in user
  const [loading, setLoading] = useState(true); // Tracks if user is being loaded
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Tracks if user is logging out
  const router = useRouter();
  const pathname = usePathname();

  // Load user from backend on mount (cookie-based authentication)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser(); // cookie is sent automatically via axios withCredentials
        if (response.success) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        // Don't log 401 errors as they're expected when user is not authenticated
        if (err.response?.status !== 401) {
          console.log("AuthContext - Error loading user:", err.message);
        } else {
          console.log("AuthContext - User not authenticated (expected)");
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Returns true if a user is logged in
  const isAuthenticated = () => user !== null;

  // Function to update user manually (after login, profile update, etc.)
  const updateUser = (userData) => setUser(userData);

  // Function to handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setUser(null);
    
    try {
      // Call backend logout to clear the cookie
      await logout();
      console.log("AuthContext - Logout successful, cookie cleared");
    } catch (error) {
      console.log("AuthContext - Logout API error (but continuing with local logout):", error.message);
      // Even if backend logout fails, we continue with local logout
    }
    
    // Reset logout state after a short delay to allow navigation
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 2000);
  };

  // Function to refresh user data from backend
  const refreshUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
        console.log("AuthContext - User refreshed:", response.data);
        return response.data;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.log("AuthContext - Error refreshing user:", err.message);
      }
      setUser(null);
      return null;
    }
  };

  // Function to redirect to home with SweetAlert when not authenticated
  const redirectToHome = async () => {
    await Swal.fire({
      title: 'Authentication Required',
      text: 'You need to be logged in to access this page.',
      icon: 'warning',
      confirmButtonText: 'Go to Login',
      confirmButtonColor: '#10b981',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-gray-900 font-bold text-xl',
        content: 'text-gray-700',
        confirmButton: 'px-6 py-3 rounded-xl font-semibold'
      }
    });
    router.push('/');
  };

  // Function to check authentication for protected routes
  const requireAuth = (allowedRoles = []) => {
    if (loading) return false; // Still loading, don't redirect yet
    if (isLoggingOut) return false; // Don't redirect during logout
    
    if (!user) {
      redirectToHome();
      return false;
    }

    // If specific roles are required, check if user has the right role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      Swal.fire({
        title: 'Access Denied',
        text: 'You do not have permission to access this page.',
        icon: 'error',
        confirmButtonText: 'Go Back',
        confirmButtonColor: '#dc2626',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-gray-900 font-bold text-xl',
          content: 'text-gray-700',
          confirmButton: 'px-6 py-3 rounded-xl font-semibold'
        }
      });
      router.push('/');
      return false;
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, updateUser, refreshUser, requireAuth, redirectToHome, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
