import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    // Application this message belongs to
    applicationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Application", 
      required: true,
      index: true 
    },
    
    // Sender of the message
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Recipient of the message
    recipientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Message content
    content: { 
      type: String, 
      required: true, 
      trim: true 
    },
    
    // Message type
    type: { 
      type: String, 
      enum: ["text", "file", "image"], 
      default: "text" 
    },
    
    // File attachment (if any)
    attachment: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    },
    
    // Message status
    status: { 
      type: String, 
      enum: ["sent", "delivered", "read"], 
      default: "sent" 
    },
    
    // Read status
    isRead: { 
      type: Boolean, 
      default: false 
    },
    
    readAt: Date,
    
    // Reply to another message (for threading)
    replyTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Message" 
    },
    
    // Message priority
    priority: { 
      type: String, 
      enum: ["low", "normal", "high", "urgent"], 
      default: "normal" 
    },
    
    // Soft delete
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
    
    deletedAt: Date,
    deletedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
MessageSchema.index({ applicationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, recipientId: 1 });
MessageSchema.index({ recipientId: 1, isRead: 1 });

// Virtual for sender details
MessageSchema.virtual("sender", {
  ref: "User",
  localField: "senderId",
  foreignField: "_id",
  justOne: true
});

// Virtual for recipient details
MessageSchema.virtual("recipient", {
  ref: "User",
  localField: "recipientId",
  foreignField: "_id",
  justOne: true
});

// Virtual for application details
MessageSchema.virtual("application", {
  ref: "Application",
  localField: "applicationId",
  foreignField: "_id",
  justOne: true
});

// Pre-save middleware to set readAt when isRead becomes true
MessageSchema.pre("save", function(next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to get conversation between two users for a specific application
MessageSchema.statics.getConversation = async function(applicationId, userId1, userId2, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return await this.find({
    applicationId,
    isDeleted: false,
    $or: [
      { senderId: userId1, recipientId: userId2 },
      { senderId: userId2, recipientId: userId1 }
    ]
  })
  .populate("senderId", "fullName email role")
  .populate("recipientId", "fullName email role")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread message count for a user
MessageSchema.statics.getUnreadCount = async function(userId, applicationId = null) {
  const query = {
    recipientId: userId,
    isRead: false,
    isDeleted: false
  };
  
  if (applicationId) {
    query.applicationId = applicationId;
  }
  
  return await this.countDocuments(query);
};

// Static method to mark messages as read
MessageSchema.statics.markAsRead = async function(messageIds, userId) {
  return await this.updateMany(
    { 
      _id: { $in: messageIds },
      recipientId: userId,
      isRead: false 
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
};

MessageSchema.set("toJSON", { virtuals: true });
MessageSchema.set("toObject", { virtuals: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
