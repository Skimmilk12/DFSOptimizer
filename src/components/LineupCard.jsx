import React from 'react';
import { extractMatchup } from '../lib/csvParser';

const LineupCard = ({
  lineup,
  totalProjection,
  totalSalary,
  salaryCap,
  gamesUsed,
  slots,
  lockedGames = new Set(),
  gameTimes = {}
}) => {
  const salaryRemaining = salaryCap - totalSalary;
  const salaryPercent = (totalSalary / salaryCap) * 100;

  const formatSalary = (salary) => {
    return `$${salary.toLocaleString()}`;
  };

  const formatGameTime = (gameString) => {
    if (!gameString) return '';
    const match = gameString.match(/(\d+:\d+[AP]M)/);
    return match ? match[1] : '';
  };

  const isGameLocked = (player) => {
    const matchup = extractMatchup(player?.game);
    return lockedGames.has(matchup);
  };

  if (!lineup || Object.keys(lineup).length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-400 mb-4">OPTIMAL LINEUP</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <p>Upload projections and click Optimize to generate lineup</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Header with stats */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">OPTIMAL LINEUP</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded">
              {gamesUsed} game{gamesUsed !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Projection and Salary */}
        <div className="flex items-center gap-6">
          <div className="text-3xl font-bold text-green-400">
            {totalProjection.toFixed(1)} <span className="text-sm font-normal text-gray-400">pts</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>{formatSalary(totalSalary)}</span>
              <span className={salaryRemaining >= 0 ? 'text-gray-400' : 'text-red-400'}>
                {salaryRemaining >= 0 ? formatSalary(salaryRemaining) + ' remaining' : 'Over cap!'}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${salaryPercent > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(salaryPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lineup Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
              <th className="px-4 py-2 text-left w-16">Pos</th>
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-center w-16">Team</th>
              <th className="px-4 py-2 text-right w-20">Salary</th>
              <th className="px-4 py-2 text-right w-16">Proj</th>
              <th className="px-4 py-2 text-right w-24">Game</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => {
              const player = lineup[slot];
              const locked = isGameLocked(player);

              return (
                <tr
                  key={slot}
                  className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${locked ? 'bg-yellow-900/10' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-10 h-6 bg-gray-700 rounded text-xs font-medium">
                      {slot}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {player?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {player?.team || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {player ? formatSalary(player.salary) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-400">
                    {player?.projection?.toFixed(1) || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {locked && (
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    <span className="text-gray-400">{formatGameTime(player?.game)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineupCard;
