import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
  recent: { label: '⏱️ Recent', emojis: ['😀', '😂', '❤️', '👍', '🎉'] },
  smileys: { label: '😀 Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇'] },
  people: { label: '👋 People', emojis: ['👋', '👍', '👎', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌', '👐', '🤲'] },
  animals: { label: '🐶 Animals', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'] },
  food: { label: '🍔 Food', emojis: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🍗', '🍖', '🌶️', '🍳', '🍱'] },
  activities: { label: '⚽ Activities', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎣', '🤿', '🎽'] },
  objects: { label: '🎈 Objects', emojis: ['🎈', '🎉', '🎊', '🎁', '🎀', '🎂', '🍰', '🎃', '💐', '🎆', '🎇', '🎀'] },
};

export const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  const categories = Object.entries(EMOJI_CATEGORIES);

  return (
    <div className="absolute bottom-16 right-0 bg-white border border-gray-300 rounded-lg shadow-xl w-80 overflow-hidden">
      {/* Category Tabs */}
      <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {categories.map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-2 py-1.5 rounded text-lg transition ${
              activeCategory === key
                ? 'bg-blue-100 border border-blue-400'
                : 'hover:bg-gray-100'
            }`}
            title={category.label}
          >
            {category.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className="text-2xl hover:scale-125 transition cursor-pointer p-1 rounded hover:bg-gray-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="w-full text-sm font-medium text-gray-700 hover:bg-gray-100 py-1.5 rounded transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const MessageReactions = ({ messageId, reactions = {}, onAddReaction, onRemoveReaction }) => {
  const [showPicker, setShowPicker] = useState(false);

  const getUniqueReactions = () => {
    return Object.entries(reactions).map(([emoji, users]) => ({
      emoji,
      count: users.length,
      users,
    }));
  };

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {getUniqueReactions().map(({ emoji, count }) => (
        <button
          key={emoji}
          onClick={() => onAddReaction(messageId, emoji)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition text-sm"
        >
          <span>{emoji}</span>
          <span className="text-xs text-gray-600">{count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 transition text-sm"
          title="Add reaction"
        >
          +
        </button>

        {showPicker && (
          <div className="absolute bottom-8 left-0">
            <EmojiPicker
              onEmojiSelect={(emoji) => onAddReaction(messageId, emoji)}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
