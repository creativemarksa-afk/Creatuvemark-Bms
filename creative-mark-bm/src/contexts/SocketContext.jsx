"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getNotifications, getUnreadCount, markAllAsRead, deleteNotification } from "../services/notificationService";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsRef = useRef([]);
  const userRef = useRef(null);

  // Keep ref updated
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Merge helper
  const mergeNotifications = (newNotifications) => {
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n._id));
      const merged = [...newNotifications.filter(n => !existingIds.has(n._id)), ...prev];
      const userId = userRef.current?.id || userRef.current?._id;
      if (typeof window !== 'undefined' && userId) {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(merged));
      }
      return merged;
    });
  };

  const incrementUnread = () => {
    setUnreadCount(prev => {
      const updated = prev + 1;
      const userId = userRef.current?.id || userRef.current?._id;
      if (typeof window !== 'undefined' && userId) {
        localStorage.setItem(`unreadCount_${userId}`, updated.toString());
      }
      return updated;
    });
  };

  const fetchUnreadCount = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      return;
    }

    try {
      const data = await getUnreadCount(userId);
      if (data.success) {
        setUnreadCount(data.unreadCount);
        localStorage.setItem(`unreadCount_${userId}`, data.unreadCount.toString());
      }
    } catch (error) {
      const stored = localStorage.getItem(`unreadCount_${userId}`);
      if (stored) {
        setUnreadCount(parseInt(stored));
        console.log('📱 Using stored unread count:', stored);
      }
    }
  }, [user?.id, user?._id]);

  const fetchNotifications = useCallback(async () => {
    const userId = user?.id || user?._id;
    if (!userId) {
      return;
    }

    try {
      const data = await getNotifications(userId);
      if (data.success) {
        mergeNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      const stored = localStorage.getItem(`notifications_${userId}`);
      if (stored) {
        try {
          const parsedNotifications = JSON.parse(stored);
          setNotifications(parsedNotifications);
        } catch (err) {
          console.error('Failed to parse localStorage notifications:', err);
        }
      }
    }
  }, [user?.id, user?._id]);

  // Load localStorage first
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId || typeof window === 'undefined') return;

    const storedNotifications = localStorage.getItem(`notifications_${userId}`);
    const storedUnread = localStorage.getItem(`unreadCount_${userId}`);
    
    if (storedNotifications) {
      try { setNotifications(JSON.parse(storedNotifications)); } 
      catch (err) { console.error(err); }
    }
    if (storedUnread) setUnreadCount(parseInt(storedUnread));

    // Fetch fresh from API
    fetchNotifications();
    fetchUnreadCount();
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Socket setup
  useEffect(() => {
    if (!user) {
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      const userId = user.id || user._id;
      if (userId) {
        fetchUnreadCount();
      }
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
    });
    
    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      console.error("❌ Socket error details:", err);
    });

    // Unified notification handler
    const handleNotification = (notification) => {
      mergeNotifications([notification]);
      incrementUnread();
    };

    newSocket.on("notification", handleNotification);
    newSocket.on("new_application_notification", handleNotification);
    newSocket.on("assignment_notification", handleNotification);
    newSocket.on("status_update_notification", handleNotification);
    newSocket.on("new_ticket_notification", handleNotification);
    newSocket.on("ticket_assignment_notification", handleNotification);
    newSocket.on("ticket_status_notification", handleNotification);
    newSocket.on("new_payment_notification", handleNotification);
    newSocket.on("payment_verification", handleNotification);

    return () => {
      newSocket.close();
    };
  }, [user, fetchUnreadCount]);

  // Mark all notifications as read
  const markNotificationsAsRead = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      const response = await markAllAsRead(userId);
      if (response.success) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`unreadCount_${userId}`, '0');
          localStorage.setItem(`notifications_${userId}`, JSON.stringify(
            notifications.map(n => ({ ...n, read: true }))
          ));
        }
      }
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    const userId = user?.id || user?._id;
    if (!userId || !notificationId) return;

    try {
      const { markNotificationAsRead: markSingle } = await import('../services/notificationService');
      const response = await markSingle(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        ));
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          const updatedNotifications = notifications.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          );
          localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications));
          localStorage.setItem(`unreadCount_${userId}`, Math.max(0, unreadCount - 1).toString());
        }
      }
    } catch (error) {
      console.error('Error marking single notification as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    try {
      // Get current notifications from state
      const currentNotifications = notificationsRef.current || [];
      
      if (currentNotifications.length > 0) {
        // Delete each notification from backend
        const deletePromises = currentNotifications.map(notification => 
          deleteNotification(notification._id || notification.id)
        );
        
        await Promise.all(deletePromises);
        
        // Clear local state
        setNotifications([]);
        setUnreadCount(0);
        
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`notifications_${userId}`);
          localStorage.setItem(`unreadCount_${userId}`, '0');
        }
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Even if backend fails, clear local state
      setNotifications([]);
      setUnreadCount(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`notifications_${userId}`);
        localStorage.setItem(`unreadCount_${userId}`, '0');
      }
    }
  };

  // Socket helper functions
  const joinApplicationRoom = (applicationId) => socket?.emit("join_application_room", applicationId);
  const leaveApplicationRoom = (applicationId) => socket?.emit("leave_application_room", applicationId);
  const sendMessage = (messageData) => socket?.emit("send_message", messageData);
  const sendTypingStart = (applicationId, userId) => socket?.emit("typing_start", { applicationId, userId });
  const sendTypingStop = (applicationId, userId) => socket?.emit("typing_stop", { applicationId, userId });
  const markMessagesAsRead = (messageIds, senderId) => {
    const userId = user?.id || user?._id;
    socket?.emit("mark_messages_read", { messageIds, userId, senderId });
  };

  const onNewMessage = (cb) => { socket?.on("new_message", cb); return () => socket?.off("new_message", cb); };
  const onUserTyping = (cb) => { socket?.on("user_typing", cb); return () => socket?.off("user_typing", cb); };
  const onMessagesRead = (cb) => { socket?.on("messages_read", cb); return () => socket?.off("messages_read", cb); };
  const onMessageError = (cb) => { socket?.on("message_error", cb); return () => socket?.off("message_error", cb); };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markNotificationsAsRead,
    markNotificationAsRead,
    clearAllNotifications,
    fetchUnreadCount,
    fetchNotifications,
    joinApplicationRoom,
    leaveApplicationRoom,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markMessagesAsRead,
    onNewMessage,
    onUserTyping,
    onMessagesRead,
    onMessageError,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export default SocketContext;
