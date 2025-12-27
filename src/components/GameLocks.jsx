import React from 'react';

const GameLocks = ({ games, lockedGames, gameTimes, onToggleLock }) => {
  const formatGameTime = (matchup) => {
    const time = gameTimes[matchup];
    if (!time) return '';

    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const hasStarted = (matchup) => {
    const time = gameTimes[matchup];
    return time && new Date() >= time;
  };

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        GAME LOCKS
        <span className="text-xs font-normal ml-2">(click to toggle)</span>
      </h3>

      <div className="flex flex-wrap gap-2">
        {games.map(matchup => {
          const isLocked = lockedGames.has(matchup);
          const started = hasStarted(matchup);
          const gameTime = formatGameTime(matchup);

          return (
            <button
              key={matchup}
              onClick={() => onToggleLock(matchup)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-colors border
                ${isLocked
                  ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300 hover:bg-yellow-900/50'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }
                ${started && !isLocked ? 'ring-2 ring-red-500/50' : ''}
              `}
              title={started ? 'Game has started!' : 'Click to lock/unlock'}
            >
              {isLocked ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
              <span>{matchup}</span>
              {gameTime && (
                <span className={`text-xs ${started ? 'text-red-400' : 'text-gray-500'}`}>
                  {gameTime}
                </span>
              )}
              {started && !isLocked && (
                <span className="text-xs text-red-400 animate-pulse">LIVE</span>
              )}
            </button>
          );
        })}
      </div>

      {games.some(m => hasStarted(m) && !lockedGames.has(m)) && (
        <p className="mt-3 text-xs text-red-400">
          Warning: Some games have started. Lock them to preserve your current picks for those games.
        </p>
      )}
    </div>
  );
};

export default GameLocks;
