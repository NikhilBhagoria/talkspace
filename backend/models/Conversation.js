import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  // Basic info
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  name: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  // Type
  isGroupChat: {
    type: Boolean,
    default: false
  },
  // Group-specific fields
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  groupIcon: {
    type: String,
    default: null
  },
  // Member management with roles
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message tracking
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  // User-specific settings (archived, muted, etc)
  userSettings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archived: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    pinnedAt: Date
  }],
  // General settings
  settings: {
    allowEditMessages: {
      type: Boolean,
      default: true
    },
    allowDeleteMessages: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    allowMedia: {
      type: Boolean,
      default: true
    }
  },
  // Status
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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

export default mongoose.model('Conversation', conversationSchema);
