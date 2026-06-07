import React, { useState, useRef, useEffect } from 'react';
import { EmojiPicker, MessageReactions } from './EmojiPicker';

export const MessageActions = ({ 
  message, 
  isOwnMessage, 
  onEdit, 
  onDelete, 
  onReact,
  onCopy 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    navigator.clipboard.writeText(content);
    setShowMenu(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Delete this message?')) {
      onDelete(message._id);
    }
    setShowMenu(false);
  };

  const handleReact = (emoji) => {
    if (onReact) {
      onReact(message._id, emoji);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
      {/* Emoji Reaction */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 hover:bg-gray-200 rounded transition"
          title="Add reaction"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-8 right-0 z-20">
            <EmojiPicker
              onEmojiSelect={handleReact}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>

      {/* Menu Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-gray-200 rounded transition"
          title="More options"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Menu Dropdown */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <button
              onClick={handleCopy}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2 first:rounded-t-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>

            {isOwnMessage && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 last:rounded-b-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
