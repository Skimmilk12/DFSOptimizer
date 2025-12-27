import React, { useState, useMemo } from 'react';

const PlayerPool = ({
  players,
  isExpanded,
  onToggleExpand,
  onToggleExclude,
  excludedPlayerIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('projection');
  const [sortDir, setSortDir] = useState('desc');

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.team.toLowerCase().includes(term) ||
        p.pos.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [players, searchTerm, sortBy, sortDir]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (!players || players.length === 0) {
    return null;
  }

  const excludedCount = excludedPlayerIds?.size || 0;

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
            PLAYER POOL
            <span className="ml-2 text-sm text-gray-400">({players.length} players)</span>
          </h3>
        </div>
        {excludedCount > 0 && (
          <span className="text-sm text-yellow-400">
            {excludedCount} excluded
          </span>
        )}
      </button>

      {/* Player Table */}
      {isExpanded && (
        <div className="border-t border-gray-700">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
                  <th className="px-4 py-2 text-center w-12">
                    <span className="sr-only">Exclude</span>
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('name')}
                  >
                    Player <SortIcon column="name" />
                  </th>
                  <th
                    className="px-4 py-2 text-center cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('pos')}
                  >
                    Pos <SortIcon column="pos" />
                  </th>
                  <th
                    className="px-4 py-2 text-center cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('team')}
                  >
                    Team <SortIcon column="team" />
                  </th>
                  <th
                    className="px-4 py-2 text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('salary')}
                  >
                    Salary <SortIcon column="salary" />
                  </th>
                  <th
                    className="px-4 py-2 text-right cursor-pointer hover:text-gray-200"
                    onClick={() => handleSort('projection')}
                  >
                    Proj <SortIcon column="projection" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const isExcluded = excludedPlayerIds?.has(player.dfsId);
                  return (
                    <tr
                      key={player.dfsId}
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 text-sm ${
                        isExcluded ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => onToggleExclude(player.dfsId)}
                          className={`w-5 h-5 rounded border ${
                            isExcluded
                              ? 'bg-red-900/50 border-red-600 text-red-400'
                              : 'border-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {isExcluded && (
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className={`px-4 py-2 ${isExcluded ? 'line-through' : ''}`}>
                        {player.name}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-400 text-xs">
                        {player.pos}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-400">
                        {player.team}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-300">
                        ${player.salary.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-green-400">
                        {player.projection.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPool;
