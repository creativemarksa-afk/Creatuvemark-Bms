import Notification from "../models/Notification.js";
import { emitToUser } from "../utils/socketHandler.js";

/**
 * ✅ Create and send a notification (DB + Real-time)
 * This is used when an event happens (like new application, assignment, etc.)
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, priority, data } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and message are required",
      });
    }

    // Save in database
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      priority,
      data,
    });
    
    await notification.save();

    // Emit real-time notification via socket
    const io = req.app.get("io");
    emitToUser(io, userId, "notification", notification);

    return res.status(201).json({
      success: true,
      message: "Notification created and sent successfully",
      notification,
    });
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/**
 * 📥 Get all notifications for a specific user
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("📥 Getting notifications for user:", userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    console.log("📨 Found notifications:", notifications.length);
    console.log("📨 Notifications:", notifications.map(n => ({ id: n._id, title: n.title, read: n.read })));

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * 🟢 Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * 🗑️ Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * 📊 Get unread notification count for a user
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔢 Getting unread count for user:", userId);

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    console.log("📊 Unread count for user", userId, ":", unreadCount);

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("❌ Error fetching unread count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message,
    });
  }
};

/**
 * ✅ Mark all notifications as read for a user
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};