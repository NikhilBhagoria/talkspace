import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check ownership
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    // Can't edit deleted messages
    if (message.isDeleted) {
      return res.status(400).json({ error: 'Cannot edit deleted message' });
    }

    // Save old content to history
    if (!message.editHistory) {
      message.editHistory = [];
    }
    message.editHistory.push({
      oldContent: message.content,
      editedAt: new Date()
    });

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    message.updatedAt = new Date();

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Error editing message' });
  }
};

// Delete message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check ownership
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '[Message deleted]';

    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Error deleting message' });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }

    // Initialize emoji array if not exists
    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, []);
    }

    const users = message.reactions.get(emoji);

    // Add user if not already reacted
    if (!users.includes(userId)) {
      users.push(userId);
    }

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Error adding reaction' });
  }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.reactions && message.reactions.has(emoji)) {
      const users = message.reactions.get(emoji);
      const index = users.indexOf(userId);

      if (index > -1) {
        users.splice(index, 1);

        // Remove emoji if no users
        if (users.length === 0) {
          message.reactions.delete(emoji);
        }
      }
    }

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Error removing reaction' });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }

    const messages = await Message.find({
      conversationId,
      content: { $regex: query, $options: 'i' },
      isDeleted: false
    })
    .populate('senderId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(messages);
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Error searching messages' });
  }
};
