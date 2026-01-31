"use client";
// Version: 2024-12-19-15:30 - Fixed 401 errors on auth pages
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { usePathname } from "next/navigation";

const MessageNotificationContext = createContext();

const MessageNotificationProviderContent = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Check if we're on an authentication page
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  

  // Poll for new messages every 30 seconds
  useEffect(() => {
    // Don't poll if user is not authenticated, if we're on auth pages, or if no token exists
    if (!user || !user.id || isAuthPage) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Additional check for token existence
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    const pollForMessages = async () => {
      try {
        // Import the service dynamically to avoid circular imports
        const { getUnreadCount } = await import("../services/messageService");
        const response = await getUnreadCount();
        if (response.success) {
          setUnreadCount(response.unreadCount);
        }
      } catch (error) {
        // Handle different types of errors
        if (error.response?.status === 401 || error.message === 'User not authenticated') {
          // User is not authenticated, don't log this as an error
          setUnreadCount(0);
          return;
        }
        
        // Only log error if it's not a network error (backend not running)
        if (!error.message.includes('Network Error') && error.code !== 'ECONNREFUSED') {
          console.error("Error polling for messages:", error);
        }
        // Set unread count to 0 if backend is not available
        setUnreadCount(0);
      }
    };

    // Initial poll
    pollForMessages();

    // Set up polling interval
    const interval = setInterval(pollForMessages, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, isAuthPage]);

  // Add notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Clear notification
  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Mark as read
  const markAsRead = () => {
    setUnreadCount(0);
  };

  const value = {
    unreadCount,
    notifications,
    isConnected,
    addNotification,
    clearNotification,
    clearAllNotifications,
    markAsRead,
    setUnreadCount
  };

  return (
    <MessageNotificationContext.Provider value={value}>
      {children}
    </MessageNotificationContext.Provider>
  );
};

export const MessageNotificationProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if we're on an authentication page
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  
  // Don't render anything until mounted (prevents SSR issues)
  if (!mounted) {
    return children;
  }
  
  // If we're on auth pages, just return children without the provider
  if (isAuthPage) {
    return children;
  }
  
  // Otherwise, use the full provider
  return <MessageNotificationProviderContent>{children}</MessageNotificationProviderContent>;
};

export const useMessageNotifications = () => {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error("useMessageNotifications must be used within a MessageNotificationProvider");
  }
  return context;
};

export default MessageNotificationContext;
