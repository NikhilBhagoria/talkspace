import Conversation from '../models/Conversation.js';

export const createConversation = async (req, res) => {
  try {
    const { participantIds = [], name, isGroupChat = false } = req.body;
    const userId = req.userId;

    if (!isGroupChat && participantIds.includes(userId)) {
      return res.status(400).json({ error: 'Cannot create a conversation with yourself' });
    }

    const participants = isGroupChat ? participantIds : [userId, ...participantIds];

    if (!isGroupChat && participants.length === 2) {
      const existing = await Conversation.findOne({
        isGroupChat: false,
        participants: { $all: participants }
      })
        .populate('participants', '-password')
        .populate({
          path: 'lastMessage',
          populate: { path: 'senderId', select: '-password' }
        });

      if (existing) {
        return res.status(200).json({
          message: 'Conversation already exists',
          data: existing
        });
      }
    }

    const conversation = new Conversation({
      participants,
      name: isGroupChat ? name : null,
      isGroupChat
    });

    await conversation.save();
    await conversation.populate('participants', '-password');

    res.status(201).json({
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: '-password' }
      })
      .sort({ lastMessageTime: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: '-password' }
      });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Conversation.findByIdAndDelete(id);

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
