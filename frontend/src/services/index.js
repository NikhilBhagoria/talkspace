import apiClient from './apiClient';

export const authService = {
  register: (username, email, password) =>
    apiClient.post('/auth/register', { username, email, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

export const userService = {
  getAllUsers: () =>
    apiClient.get('/users'),

  searchUsers: (query) =>
    apiClient.get('/users/search', { params: { q: query } }),

  getUserById: (id) =>
    apiClient.get(`/users/${id}`),

  updateProfile: (username, bio, avatar) =>
    apiClient.put('/users', { username, bio, avatar }),
};

export const messageService = {
  sendMessage: async (conversationId, content, messageType = 'text') => {
    const response = await apiClient.post('/messages', { conversationId, content, messageType });
    return response.data || response;
  },

  getConversationMessages: (conversationId) =>
    apiClient.get(`/messages/conversation/${conversationId}`),

  deleteMessage: (messageId) =>
    apiClient.delete(`/messages/${messageId}`),

  markAsRead: (messageId) =>
    apiClient.put(`/messages/${messageId}/read`),
};

export const conversationService = {
  createConversation: (participantIds, name, isGroupChat = false) =>
    apiClient.post('/conversations', { participantIds, name, isGroupChat }),

  getConversations: () =>
    apiClient.get('/conversations'),

  getConversationById: (id) =>
    apiClient.get(`/conversations/${id}`),

  deleteConversation: (id) =>
    apiClient.delete(`/conversations/${id}`),
};
