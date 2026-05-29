import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services';
import { MessageBubble } from './MessageBubble';

export const ChatWindow = ({ socket }) => {
  const { currentConversation, messages, addMessage } = useChat();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversation?._id || !socket) {
      return;
    }

    socket.emit('join_conversation', currentConversation._id);

    return () => {
      socket.emit('leave_conversation', currentConversation._id);
    };
  }, [currentConversation?._id, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (!data || !data.conversationId || !data.message) {
        console.warn('Invalid message data received:', data);
        return;
      }

      if (data.conversationId === currentConversation?._id) {
        const message = data.message;
        // Ensure message has required fields
        if (message._id && message.senderId && message.content !== undefined) {
          addMessage(message);
        } else {
          console.warn('Message missing required fields:', message);
        }
      }
    };

    const handleUserTyping = (data) => {
      if (data?.conversationId === currentConversation?._id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data?.conversationId === currentConversation?._id) {
        setIsTyping(false);
      }
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
      // Check if other user is online
      if (currentConversation && !currentConversation.isGroupChat) {
        const otherUserId = currentConversation.participants?.find(p => p._id !== user?.id)?._id;
        setOtherUserOnline(users?.includes(otherUserId));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('online_users', handleOnlineUsers);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('online_users', handleOnlineUsers);
    };
  }, [socket, currentConversation, user?.id, addMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !currentConversation) return;

    try {
      const savedMessage = await messageService.sendMessage(
        currentConversation._id,
        messageText
      );
      addMessage(savedMessage);
      setMessageText('');

      if (socket) {
        socket.emit('send_message', {
          conversationId: currentConversation._id,
          message: savedMessage,
        });

        socket.emit('stop_typing', {
          conversationId: currentConversation._id,
          userId: user?.id,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && currentConversation) {
      socket.emit('typing', {
        conversationId: currentConversation._id,
        userId: user?.id,
      });
    }
  };

  const getOtherParticipant = () => {
    return currentConversation?.participants?.find(p => p._id !== user?.id);
  };

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center max-w-md px-4">
          <div className="mb-6 inline-block p-4 bg-blue-100 rounded-full">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600 text-sm">Choose a contact from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
              {currentConversation.isGroupChat 
                ? 'G' 
                : otherParticipant?.username?.charAt(0).toUpperCase()}
              {otherUserOnline && !currentConversation.isGroupChat && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              )}
            </div>
            
            {/* User Info */}
            <div>
              <h2 className="font-bold text-lg text-gray-900">
                {currentConversation.isGroupChat
                  ? currentConversation.name
                  : otherParticipant?.username || 'User'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentConversation.isGroupChat
                  ? `${currentConversation.participants?.length} members`
                  : otherUserOnline ? '● Online' : '● Offline'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5v9a2 2 0 002 2h.93a2 2 0 001.664-.89l1.812-2.694a1 1 0 011.664 0l1.812 2.694A2 2 0 0013.07 16h.93a2 2 0 002-2v-9m-6 0a2 2 0 00-2 2v3" />
              </svg>
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5A2.25 2.25 0 008.25 22.5h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 5.25h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-sm">No messages yet. Start the conversation! 👋</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            if (!message || !message._id || !message.senderId) {
              return null;
            }
            
            const senderId = typeof message.senderId === 'string' ? message.senderId : message.senderId?._id;
            const isOwnMessage = senderId === user?.id;
            
            // Get sender name for group chats
            let senderName = null;
            if (currentConversation.isGroupChat && !isOwnMessage) {
              const sender = currentConversation.participants?.find(p => p._id === senderId);
              senderName = sender?.username;
            }
            
            return (
              <MessageBubble 
                key={message._id}
                message={message}
                isOwnMessage={isOwnMessage}
                user={user}
                senderName={senderName}
              />
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-2xl px-4 py-3 rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <button 
            type="button"
            className="p-2.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button 
            type="button"
            className="p-2.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.485 8.485L9.172 15" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2.5 hover:bg-blue-100 disabled:hover:bg-transparent disabled:opacity-40 rounded-lg transition text-blue-600 hover:text-blue-700 font-semibold flex-shrink-0"
            title="Send message"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.97501575 L3.03521743,10.4160088 C3.03521743,10.5731061 3.19218622,10.7302035 3.50612381,10.7302035 L16.6915026,11.5156905 C16.6915026,11.5156905 17.1624089,11.5156905 17.1624089,12.0000000 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
