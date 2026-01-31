import Message from "../models/Message.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let applications = [];
    if (userRole === "client") {
      // Get applications created by the client
      applications = await Application.find({ userId })
        .populate("userId", "fullName email role")
        .populate("assignedEmployees.employeeId", "fullName email role")
        .sort({ updatedAt: -1 });
    } else if (userRole === "employee") {
      // Get applications where user is assigned as employee
      applications = await Application.find({
        "assignedEmployees.employeeId": userId
      })
        .populate("userId", "fullName email role")
        .populate("assignedEmployees.employeeId", "fullName email role")
        .sort({ updatedAt: -1 });
    }

    // Get conversation summaries for each application
    const conversations = await Promise.all(
      applications.map(async (app) => {
        // Get the last message for this application
        const lastMessage = await Message.findOne({
          applicationId: app._id,
          isDeleted: false
        })
        .populate("senderId", "fullName email role")
        .sort({ createdAt: -1 });
        
        // Get unread count for this application
        const unreadCount = await Message.getUnreadCount(userId, app._id);

        // Determine conversation partner
        let conversationPartner = null;
        if (userRole === "client") {
          // Client can message with assigned employees
          if (app.assignedEmployees && app.assignedEmployees.length > 0) {
            conversationPartner = app.assignedEmployees[0].employeeId;
          }
        } else if (userRole === "employee") {
          // Employee can message with the client
          conversationPartner = app.userId;
        }

        return {
          applicationId: app._id,
          application: {
            id: app._id,
            serviceType: app.serviceType,
            status: app.status,
            createdAt: app.createdAt
          },
          conversationPartner,
          lastMessage: lastMessage ? {
            id: lastMessage._id,
            content: lastMessage.content,
            sender: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead
          } : null,
          unreadCount
        };
      })
    );

    const filteredConversations = conversations.filter(conv => conv.conversationPartner && conv.lastMessage);
    
    res.json({
      success: true,
      conversations: filteredConversations
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/conversation/:applicationId
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if user has permission to access this conversation
    let hasAccess = false;
    if (userRole === "client" && application.userId.toString() === userId) {
      hasAccess = true;
    } else if (userRole === "employee" && 
               application.assignedEmployees.some(emp => emp.employeeId.toString() === userId)) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this conversation"
      });
    }

    // Determine conversation partner
    let conversationPartnerId = null;
    if (userRole === "client") {
      conversationPartnerId = application.assignedEmployees[0]?.employeeId || null;
    } else if (userRole === "employee") {
      conversationPartnerId = application.userId;
    }

    if (!conversationPartnerId) {
      return res.status(400).json({
        success: false,
        message: "No conversation partner found"
      });
    }

    // Get messages
    const messages = await Message.getConversation(
      applicationId,
      userId,
      conversationPartnerId,
      parseInt(page),
      parseInt(limit)
    );

    // Mark messages as read
    const unreadMessageIds = messages
      .filter(msg => msg.recipientId._id.toString() === userId && !msg.isRead)
      .map(msg => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { isRead: true }
      );
    }

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { applicationId, content, type = "text", replyTo } = req.body;
    const senderId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!applicationId || !content) {
      return res.status(400).json({
        success: false,
        message: "Application ID and content are required"
      });
    }

    // Verify application exists
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Check if user has permission to send messages for this application
    let hasAccess = false;
    let recipientId = null;

    if (userRole === "client" && application.userId.toString() === senderId) {
      hasAccess = true;
      // Client can message with assigned employees
      if (application.assignedEmployees && application.assignedEmployees.length > 0) {
        recipientId = application.assignedEmployees[0].employeeId;
      }
    } else if (userRole === "employee" && 
               application.assignedEmployees.some(emp => emp.employeeId.toString() === senderId)) {
      hasAccess = true;
      // Employee can message with the client
      recipientId = application.userId;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied to send messages for this application"
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "No recipient found for this conversation"
      });
    }

    // Create message
    const message = new Message({
      applicationId,
      senderId,
      recipientId,
      content: content.trim(),
      type,
      replyTo
    });

    await message.save();

    // Populate sender and recipient details
    await message.populate([
      { path: "senderId", select: "fullName email role" },
      { path: "recipientId", select: "fullName email role" }
    ]);

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: "Message IDs array is required"
      });
    }

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        recipientId: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to delete this message"
      });
    }

    // Soft delete
    message.isDeleted = true;
    await message.save();

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.getUnreadCount(userId);
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
