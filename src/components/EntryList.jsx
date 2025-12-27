import React from 'react';

const EntryList = ({ entries, isExpanded, onToggleExpand }) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  const totalRisk = entries.reduce((sum, entry) => {
    const fee = parseFloat(entry.entryFee?.replace(/[$,]/g, '') || 0);
    return sum + fee;
  }, 0);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="font-medium">
            CASH ENTRIES
            <span className="ml-2 text-sm text-gray-400">({entries.length} filtered)</span>
          </h3>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Total Risk: </span>
          <span className="text-green-400 font-medium">${totalRisk.toFixed(2)}</span>
        </div>
      </button>

      {/* Entries Table */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
                  <th className="px-4 py-2 text-left">Entry ID</th>
                  <th className="px-4 py-2 text-left">Contest</th>
                  <th className="px-4 py-2 text-right">Fee</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.entryId || idx}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 text-sm"
                  >
                    <td className="px-4 py-2 font-mono text-gray-400">
                      {entry.entryId}
                    </td>
                    <td className="px-4 py-2 truncate max-w-xs" title={entry.contestName}>
                      {entry.contestName}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-300">
                      {entry.entryFee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryList;
