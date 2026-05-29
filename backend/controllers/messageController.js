import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;
    const senderId = req.userId;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      content,
      messageType
    });

    await message.save();
    await message.populate('senderId', '-password');

    // Update conversation
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: message._id,
        lastMessageTime: Date.now()
      },
      { new: true }
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('senderId', '-password')
      .sort({ createdAt: 1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if already read
    const isRead = message.readBy.some(r => r.userId.toString() === userId);
    if (!isRead) {
      message.readBy.push({ userId, readAt: Date.now() });
      await message.save();
    }

    res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
