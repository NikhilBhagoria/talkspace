import User from '../models/User.js';

// Block user
export const blockUser = async (req, res) => {
  try {
    const { userIdToBlock } = req.params;
    const userId = req.user.id;

    if (userId === userIdToBlock) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const user = await User.findById(userId);
    const userToBlock = await User.findById(userIdToBlock);

    if (!user || !userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to blocked users
    if (!user.blockedUsers) {
      user.blockedUsers = [];
    }

    if (!user.blockedUsers.includes(userIdToBlock)) {
      user.blockedUsers.push(userIdToBlock);
    }

    // Add to blocked by
    if (!userToBlock.blockedBy) {
      userToBlock.blockedBy = [];
    }

    if (!userToBlock.blockedBy.includes(userId)) {
      userToBlock.blockedBy.push(userId);
    }

    await user.save();
    await userToBlock.save();

    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Error blocking user' });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { userIdToUnblock } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const userToUnblock = await User.findById(userIdToUnblock);

    if (!user || !userToUnblock) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from blocked users
    if (user.blockedUsers) {
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userIdToUnblock);
    }

    // Remove from blocked by
    if (userToUnblock.blockedBy) {
      userToUnblock.blockedBy = userToUnblock.blockedBy.filter(id => id.toString() !== userId);
    }

    await user.save();
    await userToUnblock.save();

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Error unblocking user' });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('blockedUsers', 'username email avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.blockedUsers || []);
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ error: 'Error getting blocked users' });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications, muteAllNotifications, showOnlineStatus, allowGroupInvites } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.preferences) {
      user.preferences = {};
    }

    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (muteAllNotifications !== undefined) user.preferences.muteAllNotifications = muteAllNotifications;
    if (showOnlineStatus !== undefined) user.preferences.showOnlineStatus = showOnlineStatus;
    if (allowGroupInvites !== undefined) user.preferences.allowGroupInvites = allowGroupInvites;

    await user.save();

    res.json(user.preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Error updating preferences' });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.preferences || {});
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Error getting preferences' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -blockedUsers -blockedBy');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Error getting user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar, bio, username } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check username availability if changing
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    if (avatar) user.avatar = avatar;
    if (bio) user.bio = bio;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};
