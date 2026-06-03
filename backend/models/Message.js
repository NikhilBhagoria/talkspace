import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  // Media/Attachment support
  attachment: {
    url: String,
    fileName: String,
    fileSize: Number,
    fileType: String
  },
  // Message status tracking
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Edit history
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    oldContent: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Soft delete support
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  // Reactions/Emoji support
  reactions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
    default: new Map()
  },
  // Reply/Thread support
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Message', messageSchema);
