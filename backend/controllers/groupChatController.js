import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// Create group chat
export const createGroupChat = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!Array.isArray(memberIds) || memberIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 members are required' });
    }

    // Include creator in members
    const allMemberIds = [userId, ...memberIds];

    // Create members array with roles
    const members = allMemberIds.map(id => ({
      userId: id,
      role: id.toString() === userId.toString() ? 'admin' : 'member',
      joinedAt: new Date()
    }));

    const conversation = new Conversation({
      name: name.trim(),
      description: description || '',
      participants: allMemberIds,
      isGroupChat: true,
      groupAdmin: userId,
      members,
      settings: {
        allowEditMessages: true,
        allowDeleteMessages: true,
        allowReactions: true,
        allowMedia: true
      }
    });

    await conversation.save();
    await conversation.populate('participants', 'username email avatar');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Error creating group chat' });
  }
};

// Add member to group
export const addGroupMember = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroupChat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = conversation.groupAdmin.toString() === currentUserId.toString();
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if user already in group
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ error: 'User already in group' });
    }

    conversation.participants.push(userId);
    conversation.members.push({
      userId,
      role: 'member',
      joinedAt: new Date()
    });

    await conversation.save();
    await conversation.populate('participants', 'username email avatar');

    res.json(conversation);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Error adding member' });
  }
};

// Remove member from group
export const removeGroupMember = async (req, res) => {
  try {
    const { conversationId, memberId } = req.params;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroupChat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = conversation.groupAdmin.toString() === currentUserId.toString();
    if (!isAdmin && memberId !== currentUserId) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Remove from participants
    conversation.participants = conversation.participants.filter(
      id => id.toString() !== memberId
    );

    // Remove from members
    conversation.members = conversation.members.filter(
      m => m.userId.toString() !== memberId
    );

    await conversation.save();
    await conversation.populate('participants', 'username email avatar');

    res.json(conversation);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Error removing member' });
  }
};

// Update group info
export const updateGroupInfo = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, description, groupIcon } = req.body;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroupChat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    if (conversation.groupAdmin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Only admins can update group info' });
    }

    if (name) conversation.name = name;
    if (description !== undefined) conversation.description = description;
    if (groupIcon) conversation.groupIcon = groupIcon;

    await conversation.save();
    await conversation.populate('participants', 'username email avatar');

    res.json(conversation);
  } catch (error) {
    console.error('Error updating group info:', error);
    res.status(500).json({ error: 'Error updating group info' });
  }
};

// Change member role
export const changeGroupMemberRole = async (req, res) => {
  try {
    const { conversationId, memberId } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.id;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroupChat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    if (conversation.groupAdmin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    const member = conversation.members.find(m => m.userId.toString() === memberId);
    if (member) {
      member.role = role;
    }

    await conversation.save();

    res.json(conversation);
  } catch (error) {
    console.error('Error changing member role:', error);
    res.status(500).json({ error: 'Error changing member role' });
  }
};
