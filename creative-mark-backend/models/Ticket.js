import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'application', 'payment', 'document', 'technical', 'billing'],
    default: 'general'
  },
  attachments: [{
    name: String,
    url: String,
    size: Number,
    type: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ userId: 1, status: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);