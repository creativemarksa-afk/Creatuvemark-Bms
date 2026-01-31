import mongoose from 'mongoose';

const ticketReplySchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  from: {
    type: String,
    enum: ['user', 'support'],
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  isInternal: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketReplySchema.index({ ticketId: 1, createdAt: 1 });

export default mongoose.models.TicketReply || mongoose.model('TicketReply', ticketReplySchema);