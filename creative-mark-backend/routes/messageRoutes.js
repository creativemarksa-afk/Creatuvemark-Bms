import express from "express";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  getUnreadCount
} from "../controllers/messageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(authMiddleware);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the authenticated user
// @access  Private
router.get("/conversations", getConversations);

// @route   GET /api/messages/conversation/:applicationId
// @desc    Get messages for a specific conversation
// @access  Private
router.get("/conversation/:applicationId", getConversationMessages);

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post("/", sendMessage);

// @route   PUT /api/messages/read
// @desc    Mark messages as read
// @access  Private
router.put("/read", markMessagesAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete("/:messageId", deleteMessage);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count
// @access  Private
router.get("/unread-count", getUnreadCount);

export default router;
