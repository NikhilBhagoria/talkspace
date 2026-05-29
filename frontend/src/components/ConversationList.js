import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
};

const getColorForInitials = (name, index) => {
  const colors = [
    'bg-red-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-teal-500',
  ];
  return colors[(name?.charCodeAt(0) + index) % colors.length];
};

const formatTime = (lastMessageTime) => {
  if (!lastMessageTime) return '';

  const now = new Date();
  const messageTime = new Date(lastMessageTime);
  const diffMs = now - messageTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[messageTime.getDay()];
  }
  return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ConversationList = ({ onSelectConversation, selectedConversationId, onlineUsers = [] }) => {
  const { conversations } = useChat();
  const { user } = useAuth();

  const getOtherUser = (conversation) => {
    if (!conversation.participants || conversation.participants.length === 0) {
      return null;
    }
    return conversation.participants.find((p) => p._id !== user?.id);
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    // Handle case where lastMessage is an object with content property
    const messageContent = typeof conversation.lastMessage === 'object' 
      ? conversation.lastMessage.content 
      : conversation.lastMessage;
    
    if (!messageContent) return 'No messages yet';
    
    return String(messageContent).substring(0, 50);
  };

  return (
    <div className="conversations-list h-full overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-400 text-center p-4">
          <div>
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start chatting with someone!</p>
          </div>
        </div>
      ) : (
        conversations.map((conversation, index) => {
          if (!conversation?._id) return null;
          
          const otherUser = getOtherUser(conversation);
          const displayName = conversation.isGroupChat ? conversation.name : otherUser?.username || 'Unknown User';
          const isSelected = selectedConversationId === conversation._id;
          const isOtherUserOnline = otherUser && onlineUsers?.includes(otherUser._id);
          const hasUnread = conversation.unreadCount > 0;
          
          return (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={`px-4 py-3 border-b border-slate-800 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-slate-800 border-blue-500/50' 
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar with Online Indicator */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ${getColorForInitials(
                      otherUser?.username || conversation.name,
                      index
                    )}`}
                  >
                    {conversation.isGroupChat ? 'G' : getInitials(otherUser?.username)}
                  </div>
                  {/* Online Status Indicator */}
                  {!conversation.isGroupChat && isOtherUserOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-medium truncate ${hasUnread ? 'text-white font-semibold' : 'text-slate-100'}`}>
                      {displayName}
                    </h3>
                    <span className={`text-xs flex-shrink-0 ml-1 ${hasUnread ? 'text-blue-400 font-semibold' : 'text-slate-500'}`}>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${hasUnread ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>

                {/* Unread Badge */}
                {hasUnread && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 shadow-lg"></div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
