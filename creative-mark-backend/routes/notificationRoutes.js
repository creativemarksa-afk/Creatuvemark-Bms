import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
  markAllAsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create new notification (admin, system, etc.)
router.post("/", authMiddleware, createNotification);

// Get all notifications for a specific user
router.get("/:userId", authMiddleware, getUserNotifications);

// Get unread notification count for a user
router.get("/:userId/unread-count", authMiddleware, getUnreadCount);

// Mark one as read
router.put("/:notificationId/read", authMiddleware, markAsRead);

// Mark all notifications as read for a user
router.patch("/:userId/mark-all-read", authMiddleware, markAllAsRead);

// Delete one
router.delete("/:notificationId", authMiddleware, deleteNotification);

export default router;
