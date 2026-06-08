import React, { useState } from 'react';
import { userService } from '../services';

export const UserProfile = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getUserById(userId);
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        setIsLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  const handleBlockUser = async () => {
    try {
      setIsBlocked(!isBlocked);
      // API call would go here
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.username}</h3>
          <p className="text-gray-600 text-sm mb-4">{user?.email}</p>

          {/* Status */}
          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-6">
            ● Online
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-gray-600">Conversations</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-600">Messages</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={handleBlockUser}
            className={`w-full py-2.5 rounded-lg font-medium transition ${
              isBlocked
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isBlocked ? 'Unblock User' : 'Block User'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
