import React, { useState } from 'react';

const FilterConfig = ({ keywords, onKeywordsChange }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      onKeywordsChange([...keywords, trimmed]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        ENTRY FILTER KEYWORDS
      </h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {keywords.map(keyword => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-sm"
          >
            {keyword}
            <button
              onClick={() => handleRemoveKeyword(keyword)}
              className="text-gray-400 hover:text-red-400"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add keyword (e.g., your H2H username)"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAddKeyword}
          disabled={!newKeyword.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Entries with contest names containing any of these keywords will be included for export.
      </p>
    </div>
  );
};

export default FilterConfig;
