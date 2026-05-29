import React from 'react';

export const MessageBubble = ({ message, isOwnMessage, user, senderName }) => {
  const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId?._id;
  const messageContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className={`flex gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - Only show for other user's messages, and not every message */}
        {!isOwnMessage && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
            {getInitials(senderName)}
          </div>
        )}
        
        {/* Message bubble */}
        <div className="flex flex-col gap-1">
          {/* Sender name for group chats (show only for other user's messages) */}
          {!isOwnMessage && senderName && (
            <span className="text-xs font-semibold text-gray-600 px-3 pt-1">
              {senderName}
            </span>
          )}
          
          <div
            className={`rounded-2xl px-4 py-3 break-words shadow-sm transition ${
              isOwnMessage
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            <p className="text-sm leading-relaxed">{messageContent}</p>
          </div>
          
          {/* Time - Show on hover or always for own messages */}
          <span
            className={`text-xs px-3 pt-0.5 transition opacity-0 group-hover:opacity-100 ${
              isOwnMessage ? 'opacity-100 text-blue-600' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
