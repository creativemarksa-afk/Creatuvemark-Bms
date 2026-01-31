import { Server } from 'socket.io';

/**
 * Initialize and configure Socket.IO server
 * @param {Object} server - HTTP server instance
 * @param {string} clientUrl - Frontend URL for CORS
 * @returns {Server} - Configured Socket.IO server instance
 */
export const initializeSocket = (server, clientUrl) => {
  console.log("Socket.IO CORS Configuration - CLIENT_URL:", clientUrl);
  
  const io = new Server(server, {
    cors: {
      origin: clientUrl || "http://localhost:3000",
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  return io;
};

/**
 * Setup socket event handlers
 * @param {Server} io - Socket.IO server instance
 */
export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    
    // Join user to their personal room
    socket.on('join_user_room', (userId) => {
      console.log(`👤 User ${userId} joined personal room`);
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} is now in room: user_${userId}`);
    });
    
    // Join application-specific room
    socket.on('join_application_room', (applicationId) => {
      socket.join(`application_${applicationId}`);
      console.log(`User joined application room: ${applicationId}`);
    });

    // Leave application-specific room
    socket.on('leave_application_room', (applicationId) => {
      socket.leave(`application_${applicationId}`);
      console.log(`User left application room: ${applicationId}`);
    });

    // Handle new message
    socket.on('send_message', async (messageData) => {
      try {
        // Import models here to avoid circular dependency
        const Message = (await import('../models/Message.js')).default;
        const Application = (await import('../models/Application.js')).default;
        const User = (await import('../models/User.js')).default;
        
        // Get application to determine recipient
        const application = await Application.findById(messageData.applicationId);
        if (!application) {
          socket.emit('message_error', { error: 'Application not found' });
          return;
        }

        // Determine recipient based on sender role and application
        let recipientId = null;
        const sender = await User.findById(messageData.senderId);
        
        if (sender.role === 'client') {
          // Client can message with assigned employees
          if (application.assignedEmployees && application.assignedEmployees.length > 0) {
            recipientId = application.assignedEmployees[0].employeeId;
          }
        } else if (sender.role === 'employee') {
          // Employee can message with the client
          recipientId = application.userId;
        }

        if (!recipientId) {
          socket.emit('message_error', { error: 'No recipient found for this conversation' });
          return;
        }

        // Create message with recipient ID
        const message = new Message({
          ...messageData,
          recipientId
        });
        
        await message.save();
        
        // Populate sender and recipient details
        await message.populate([
          { path: 'senderId', select: 'fullName email role' },
          { path: 'recipientId', select: 'fullName email role' }
        ]);

        // Emit message to both sender and recipient
        io.to(`user_${messageData.senderId}`).emit('new_message', message);
        io.to(`user_${recipientId}`).emit('new_message', message);
        
        // Also emit to application room
        io.to(`application_${messageData.applicationId}`).emit('new_message', message);
        
        console.log('Message sent:', message._id);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`application_${data.applicationId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`application_${data.applicationId}`).emit('user_typing', {
        userId: data.userId,
        isTyping: false
      });
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      try {
        const Message = (await import('../models/Message.js')).default;
        
        await Message.markAsRead(data.messageIds, data.userId);
        
        // Notify sender that messages were read
        io.to(`user_${data.senderId}`).emit('messages_read', {
          messageIds: data.messageIds,
          readBy: data.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
    
    // Handle socket errors
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });
};

/**
 * Get socket instance for use in routes
 * @param {Object} app - Express app instance
 * @returns {Server} - Socket.IO server instance
 */
export const getSocketInstance = (app) => {
  return app.get('io');
};

/**
 * Emit event to specific user
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Data to emit
 */
export const emitToUser = (io, userId, event, data) => {
  console.log(`📤 Emitting ${event} to user_${userId}:`, data);
  io.to(`user_${userId}`).emit(event, data);
};

/**
 * Emit event to application room
 * @param {Server} io - Socket.IO server instance
 * @param {string} applicationId - Application ID
 * @param {string} event - Event name
 * @param {Object} data - Data to emit
 */
export const emitToApplication = (io, applicationId, event, data) => {
  io.to(`application_${applicationId}`).emit(event, data);
};

/**
 * Emit event to all connected clients
 * @param {Server} io - Socket.IO server instance
 * @param {string} event - Event name
 * @param {Object} data - Data to emit
 */
export const emitToAll = (io, event, data) => {
  io.emit(event, data);
};
