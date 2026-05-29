import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../hooks/useSocket';
import { ChatWindow } from '../components/ChatWindow';
import { ConversationList } from '../components/ConversationList';
import { userService } from '../services';

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

export const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    conversations,
    currentConversation,
    loadConversations,
    selectConversation,
    createNewConversation,
    setOnlineUsers,
  } = useChat();
  const { socket, isConnected } = useSocket(user?.id);
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsersLocal] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on('online_users', (users) => {
        setOnlineUsersLocal(users);
        setOnlineUsers(users);
      });
    }
  }, [socket, setOnlineUsers]);

  const handleLoadUsers = async () => {
    try {
      const users = await userService.getAllUsers();
      const filteredUsers = Array.isArray(users)
        ? users.filter((u) => u._id !== user?.id)
        : [];
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleStartNewChat = async (userId) => {
    try {
      if (userId === user?.id) {
        return;
      }

      const existingConversation = conversations.find((conv) => {
        if (conv.isGroupChat) return false;
        return conv.participants.some((p) => p._id === userId);
      });

      if (existingConversation) {
        selectConversation(existingConversation._id);
      } else {
        const conversation = await createNewConversation([userId], null, false);
        selectConversation(conversation._id);
        setTimeout(() => loadConversations(), 500);
      }
      setShowNewChat(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredConversations = conversations.filter((conv) => {
    const participantName = conv.participants
      ?.find((p) => p._id !== user?.id)
      ?.username?.toLowerCase() || '';
    return participantName.includes(searchQuery.toLowerCase());
  });

  const filteredUsers = allUsers.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?.id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-lg">💬</span>
            </div>
            <h1 className="text-base font-bold tracking-tight">MERNChat</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/50 px-4">
          <button
            onClick={() => {
              setActiveTab('chats');
              setShowNewChat(false);
              setSearchQuery('');
            }}
            className={`py-3 px-1 text-sm font-medium transition relative ${
              activeTab === 'chats'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Chats
            {activeTab === 'chats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('contacts');
              setShowNewChat(false);
              setSearchQuery('');
              if (allUsers.length === 0) {
                handleLoadUsers();
              }
            }}
            className={`py-3 px-1 text-sm font-medium transition relative ml-8 ${
              activeTab === 'contacts'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Contacts
            {activeTab === 'contacts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            )}
          </button>
          <button className="ml-auto py-3 text-slate-400 hover:text-slate-200 transition p-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>

        {/* Conversations/Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' ? (
            filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                <p className="text-sm">No conversations yet</p>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              <ConversationList 
                onSelectConversation={selectConversation}
                selectedConversationId={currentConversation?._id}
                onlineUsers={onlineUsers}
              />
            )
          ) : (
            <>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <p className="text-sm">No contacts found</p>
                </div>
              ) : (
                filteredUsers.map((u, index) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartNewChat(u._id)}
                    className="px-4 py-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${getColorForInitials(
                          u.username,
                          index
                        )}`}
                      >
                        {getInitials(u.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{u.username}</h4>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="px-4 py-3 border-t border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center justify-between gap-3">
            {/* Left - Avatar & Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm relative flex-shrink-0">
                {getInitials(user?.username)}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{user?.username}</p>
                <p className="text-xs text-green-400 font-medium">● Online</p>
              </div>
            </div>
            
            {/* Right - Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-slate-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition text-slate-400 hover:text-red-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      {currentConversation ? (
        <ChatWindow socket={socket} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white">
          {/* Empty State */}
          <div className="text-center max-w-2xl px-4">
            {/* Icon Section */}
            <div className="relative mb-8 flex justify-center">
              {/* Heart Icon */}
              <div className="absolute left-0 top-32">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>

              {/* Main Icon Container */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center border border-gray-200 shadow-sm">
                  <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>

                {/* Settings Icon */}
                <div className="absolute top-0 right-0 bg-gray-800 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Select a conversation</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Choose a contact from the sidebar to start chatting, or create a<br /> new conversation to connect with your team.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center mb-12">
              <button
                onClick={() => setActiveTab('contacts')}
                className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
              >
                <span>+</span> New Chat
              </button>
              <button className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Contact
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition">
                <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">End-to-end</h4>
                <p className="text-xs text-gray-500 mt-1">Encrypted</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition">
                <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Realtime</h4>
                <p className="text-xs text-gray-500 mt-1">Socket.io</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition">
                <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Synced</h4>
                <p className="text-xs text-gray-500 mt-1">MongoDB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
          Connecting...
        </div>
      )}
    </div>
  );
};
