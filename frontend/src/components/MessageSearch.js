import React, { useState, useEffect } from 'react';
import { messageService } from '../services';

export const MessageSearch = ({ conversationId, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim() || !conversationId) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // This would be a real API call
        // const results = await messageService.searchMessages(conversationId, searchQuery);
        // For now, we'll set up the UI structure
        setSearchResults([]);
      } catch (error) {
        console.error('Error searching messages:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, conversationId]);

  return (
    <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg w-80 z-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Search Messages</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          autoFocus
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">
            <p>Searching...</p>
          </div>
        ) : searchResults.length === 0 && searchQuery.trim() ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No messages found</p>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Start typing to search</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {searchResults.map((message) => (
              <div
                key={message._id}
                onClick={() => setSelectedMessage(message)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedMessage?._id === message._id
                    ? 'bg-blue-100 border border-blue-500'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <p className="text-sm text-gray-900">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
