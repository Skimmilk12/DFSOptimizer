import { POS_COLORS } from '../engine/constants';
import { useFileUpload } from '../hooks/useFileUpload';
import PosBadge from './ui/PosBadge';
import PlayerTable from './PlayerTable';

export default function UploadStep({
  players,
  entries,
  fileName,
  optimalLineup,
  findingOptimal,
  onFile,
  onNext,
}) {
  const { fileRef, onDragOver, onDrop, onClick, onChange } =
    useFileUpload(onFile);

  return (
    <div className="fade-in space-y-6">
      <div
        className="glass-card glow rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-400/30 transition-all"
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onChange}
        />
        <div className="text-5xl mb-4">{players.length ? '✅' : '📁'}</div>
        <p className="font-display font-semibold text-lg text-gray-200">
          {players.length ? 'File Loaded Successfully' : 'Drop DraftKings CSV Here'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {players.length
            ? `${players.length} players · ${entries.length} entries`
            : 'or click to browse'}
        </p>
      </div>

      {players.length > 0 && (
        <>
          {/* Position summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(POS_COLORS).map(([pos, color]) => {
              const count = players.filter((p) => p.position === pos).length;
              const viable = players.filter(
                (p) => p.position === pos && p.projection > 0
              ).length;
              return (
                <div key={pos} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="font-display font-bold"
                      style={{ color }}
                    >
                      {pos}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{viable}</p>
                  <p className="text-xs text-gray-500">
                    {count - viable} zero-proj
                  </p>
                </div>
              );
            })}
          </div>

          {/* Contest entries */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-gray-200">
                Contest Entries
              </h3>
              <span className="text-xs text-gray-500">
                {entries.length} entries
              </span>
            </div>
            <div className="space-y-2">
              {entries.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {e.contestName}
                  </span>
                  <span className="text-sm font-bold text-cyan-400 ml-4">
                    ${e.entryFee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimal lineup */}
          {optimalLineup && (
            <div className="glass-card glow-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-cyan-300">
                  ⚡ Optimal Lineup Found
                </h3>
                <div className="text-right">
                  <span className="text-2xl font-bold text-cyan-400">
                    {optimalLineup.projection.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    pts · ${optimalLineup.salary.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {optimalLineup.players.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm"
                  >
                    <PosBadge pos={p.position} />
                    <span className="text-gray-200">{p.name}</span>
                    <span className="text-gray-500">
                      {p.projection.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {findingOptimal && (
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-gray-400 font-display">
                Finding optimal lineup...
              </p>
            </div>
          )}

          {/* Player table */}
          <PlayerTable players={players} />

          {/* Continue button */}
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              color: '#050a18',
            }}
          >
            Continue to Configure →
          </button>
        </>
      )}
    </div>
  );
}
