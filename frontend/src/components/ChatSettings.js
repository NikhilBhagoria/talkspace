import React, { useState, useEffect } from 'react';

export const ChatSettings = ({ conversationId, onClose, onSettingChange }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    muteNotifications: false,
    archive: false,
    blockUser: false,
    deleteHistory: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load conversation settings from API
    const loadSettings = async () => {
      try {
        // This would be a real API call
        // const data = await conversationService.getSettings(conversationId);
        // setSettings(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, [conversationId]);

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    if (onSettingChange) {
      onSettingChange(key, newSettings[key]);
    }
  };

  const handleDeleteHistory = () => {
    if (window.confirm('Delete all messages in this conversation? This cannot be undone.')) {
      handleToggle('deleteHistory');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Conversation Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading settings...</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Notifications */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Notifications</h3>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Enable Notifications</p>
                  <p className="text-xs text-gray-600">Receive message alerts</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleToggle('notifications')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </label>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg transition ${
                  settings.notifications
                    ? 'bg-gray-50 opacity-100'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">Mute Notifications</p>
                  <p className="text-xs text-gray-600">Silent but visible</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.muteNotifications}
                    onChange={() => handleToggle('muteNotifications')}
                    disabled={!settings.notifications}
                    className="w-5 h-5 cursor-pointer disabled:opacity-50"
                  />
                </label>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Archive */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Organization</h3>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Archive Chat</p>
                  <p className="text-xs text-gray-600">Hide from main list</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.archive}
                    onChange={() => handleToggle('archive')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Privacy & Safety */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Privacy & Safety</h3>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Block User</p>
                  <p className="text-xs text-gray-600">Stop receiving messages</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.blockUser}
                    onChange={() => handleToggle('blockUser')}
                    className="w-5 h-5 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="font-semibold text-red-600 text-sm">Danger Zone</h3>

              <button
                onClick={handleDeleteHistory}
                className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition"
              >
                <p className="font-medium text-red-600 text-sm">Delete Message History</p>
                <p className="text-xs text-red-600">Remove all messages permanently</p>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
