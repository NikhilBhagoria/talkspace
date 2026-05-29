import React, { createContext, useContext, useState, useCallback } from 'react';
import { conversationService, messageService } from '../services';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectConversation = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      setMessages([]); // Clear previous messages
      
      const conversationResponse = await conversationService.getConversationById(conversationId);
      const conversation = conversationResponse.data || conversationResponse;
      
      setCurrentConversation(conversation);
      
      const messagesResponse = await messageService.getConversationMessages(conversationId);
      const messages = Array.isArray(messagesResponse) ? messagesResponse : messagesResponse.data || [];
      
      setMessages(messages);
    } catch (err) {
      setError(err);
      console.error('Error selecting conversation:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const createNewConversation = useCallback(async (participantIds, name, isGroupChat) => {
    try {
      setError(null);
      const response = await conversationService.createConversation(
        participantIds,
        name,
        isGroupChat
      );
      // Extract conversation from response wrapper
      const conversation = response.data || response;
      
      // Check if conversation already exists in the list
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) {
          return prev; // Don't add duplicate
        }
        return [conversation, ...prev];
      });
      
      setCurrentConversation(conversation);
      return conversation;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    onlineUsers,
    typingUsers,
    loadConversations,
    selectConversation,
    addMessage,
    createNewConversation,
    setOnlineUsers,
    setTypingUsers,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
