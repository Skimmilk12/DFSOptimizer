import React, { useState, useCallback, useMemo } from 'react';
import FileUpload from './components/FileUpload';
import LineupCard from './components/LineupCard';
import GameLocks from './components/GameLocks';
import EntryList from './components/EntryList';
import PlayerPool from './components/PlayerPool';
import FilterConfig from './components/FilterConfig';
import { parseProjectionsCSV, parseEntriesCSV, getUniqueGames, extractMatchup } from './lib/csvParser';
import { optimizeLineup, getLockedPlayers, SLOTS, SALARY_CAP } from './lib/optimizer';
import { generateExportCSV, downloadCSV, generateFilename } from './lib/exportLineup';
import { SPORTS, DEFAULT_SPORT, DEFAULT_FORMAT } from './config/sports';

function App() {
  // Sport/format selection
  const [sport, setSport] = useState(DEFAULT_SPORT);
  const [format, setFormat] = useState(DEFAULT_FORMAT);

  // File state
  const [projectionsFile, setProjectionsFile] = useState(null);
  const [entriesFile, setEntriesFile] = useState(null);

  // Parsed data
  const [players, setPlayers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [gameTimes, setGameTimes] = useState({});
  const [entriesColumns, setEntriesColumns] = useState([]);
  const [allEntriesData, setAllEntriesData] = useState([]);

  // Optimization state
  const [lineup, setLineup] = useState({});
  const [totalProjection, setTotalProjection] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [gamesUsed, setGamesUsed] = useState(0);

  // UI state
  const [lockedGames, setLockedGames] = useState(new Set());
  const [excludedPlayerIds, setExcludedPlayerIds] = useState(new Set());
  const [filterKeywords, setFilterKeywords] = useState(['Double Up']);
  const [entriesExpanded, setEntriesExpanded] = useState(false);
  const [playerPoolExpanded, setPlayerPoolExpanded] = useState(false);

  // Loading/error state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  // Get current sport config
  const sportConfig = useMemo(() => {
    return SPORTS[sport]?.[format] || SPORTS.NBA.classic;
  }, [sport, format]);

  // Get unique games from players
  const games = useMemo(() => getUniqueGames(players), [players]);

  // Filter entries based on keywords
  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];
    return entries.filter(entry =>
      filterKeywords.some(kw =>
        entry.contestName.toLowerCase().includes(kw.toLowerCase())
      )
    );
  }, [entries, filterKeywords]);

  // Handle projections file upload
  const handleProjectionsUpload = useCallback(async (file) => {
    setProjectionsFile(file);
    setError(null);

    try {
      const parsedPlayers = await parseProjectionsCSV(file);
      setPlayers(parsedPlayers);

      // Reset lineup when new projections are loaded
      setLineup({});
      setTotalProjection(0);
      setTotalSalary(0);
      setGamesUsed(0);
      setLockedGames(new Set());
    } catch (err) {
      setError(`Error parsing projections: ${err.message}`);
      setPlayers([]);
    }
  }, []);

  // Handle entries file upload
  const handleEntriesUpload = useCallback(async (file) => {
    setEntriesFile(file);
    setError(null);

    try {
      const result = await parseEntriesCSV(file, filterKeywords);
      setEntries(result.entries);
      setGameTimes(result.gameTimes);
      setEntriesColumns(result.columns);
      setAllEntriesData(result.allData);
    } catch (err) {
      setError(`Error parsing entries: ${err.message}`);
      setEntries([]);
    }
  }, [filterKeywords]);

  // Toggle game lock
  const handleToggleLock = useCallback((matchup) => {
    setLockedGames(prev => {
      const next = new Set(prev);
      if (next.has(matchup)) {
        next.delete(matchup);
      } else {
        next.add(matchup);
      }
      return next;
    });
  }, []);

  // Toggle player exclusion
  const handleToggleExclude = useCallback((playerId) => {
    setExcludedPlayerIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }, []);

  // Run optimization
  const handleOptimize = useCallback(() => {
    if (!players.length) {
      setError('Please upload projections first');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        // Get locked players based on current lineup and locked games
        const lockedPlayers = getLockedPlayers(lineup, lockedGames);

        const result = optimizeLineup(players, {
          lockedPlayers,
          excludedPlayerIds,
          salaryCap: sportConfig.salaryCap,
          slots: sportConfig.slots,
          minGames: sportConfig.minGames
        });

        if (result.feasible) {
          setLineup(result.lineup);
          setTotalProjection(result.totalProjection);
          setTotalSalary(result.totalSalary);
          setGamesUsed(result.gamesUsed);
          setError(null);
        } else {
          setError(result.error || 'No valid lineup found with current constraints');
        }
      } catch (err) {
        setError(`Optimization error: ${err.message}`);
      } finally {
        setIsOptimizing(false);
      }
    }, 10);
  }, [players, lineup, lockedGames, excludedPlayerIds, sportConfig]);

  // Export lineup
  const handleExport = useCallback(() => {
    if (!Object.keys(lineup).length) {
      setError('No lineup to export. Run optimization first.');
      return;
    }

    if (!filteredEntries.length) {
      setError('No cash entries to export to. Upload entries file.');
      return;
    }

    try {
      const csvString = generateExportCSV(
        filteredEntries,
        lineup,
        entriesColumns,
        allEntriesData
      );
      const filename = generateFilename('DK_CashLineups');
      downloadCSV(csvString, filename);
    } catch (err) {
      setError(`Export error: ${err.message}`);
    }
  }, [lineup, filteredEntries, entriesColumns, allEntriesData]);

  // Re-parse entries when keywords change
  const handleKeywordsChange = useCallback((newKeywords) => {
    setFilterKeywords(newKeywords);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">DFS CASH OPTIMIZER</h1>
            <div className="flex items-center gap-3">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.keys(SPORTS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.keys(SPORTS[sport] || {}).map(f => (
                  <option key={f} value={f}>{SPORTS[sport][f].name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* File Upload Section */}
        <section className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">UPLOAD</h2>
          <div className="flex gap-4">
            <FileUpload
              label="Projections"
              onFileSelect={handleProjectionsUpload}
              fileName={projectionsFile?.name}
              status={players.length ? `${players.length} players loaded` : null}
            />
            <FileUpload
              label="Entries (Optional)"
              onFileSelect={handleEntriesUpload}
              fileName={entriesFile?.name}
              status={entries.length ? `${filteredEntries.length} cash entries found` : null}
            />
          </div>
        </section>

        {/* Lineup Display */}
        <LineupCard
          lineup={lineup}
          totalProjection={totalProjection}
          totalSalary={totalSalary}
          salaryCap={sportConfig.salaryCap}
          gamesUsed={gamesUsed}
          slots={sportConfig.slots}
          lockedGames={lockedGames}
          gameTimes={gameTimes}
        />

        {/* Game Locks */}
        {games.length > 0 && Object.keys(lineup).length > 0 && (
          <GameLocks
            games={games}
            lockedGames={lockedGames}
            gameTimes={gameTimes}
            onToggleLock={handleToggleLock}
          />
        )}

        {/* Player Pool */}
        {players.length > 0 && (
          <PlayerPool
            players={players}
            isExpanded={playerPoolExpanded}
            onToggleExpand={() => setPlayerPoolExpanded(!playerPoolExpanded)}
            onToggleExclude={handleToggleExclude}
            excludedPlayerIds={excludedPlayerIds}
          />
        )}

        {/* Entry List */}
        {filteredEntries.length > 0 && (
          <EntryList
            entries={filteredEntries}
            isExpanded={entriesExpanded}
            onToggleExpand={() => setEntriesExpanded(!entriesExpanded)}
          />
        )}

        {/* Filter Keywords */}
        {entries.length > 0 && (
          <FilterConfig
            keywords={filterKeywords}
            onKeywordsChange={handleKeywordsChange}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleOptimize}
            disabled={!players.length || isOptimizing}
            className={`
              flex-1 py-3 px-6 rounded-lg font-semibold text-lg
              transition-colors flex items-center justify-center gap-2
              ${players.length && !isOptimizing
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isOptimizing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Optimizing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                OPTIMIZE
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={!Object.keys(lineup).length || !filteredEntries.length}
            className={`
              flex-1 py-3 px-6 rounded-lg font-semibold text-lg
              transition-colors flex items-center justify-center gap-2
              ${Object.keys(lineup).length && filteredEntries.length
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            EXPORT LINEUPS
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>
            {sportConfig.name} • ${sportConfig.salaryCap.toLocaleString()} Cap • {sportConfig.rosterSize} Players • Min {sportConfig.minGames} Games
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
