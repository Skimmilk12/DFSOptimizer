import { useCallback } from 'react';
import { optimizePortfolio, exportCSV } from '../engine/portfolio';
import PosBadge from './ui/PosBadge';
import Stat from './ui/Stat';

export default function OptimizeStep({
  simResults,
  entries,
  settings,
  portfolio,
  setPortfolio,
}) {
  const startOptimization = useCallback(() => {
    if (!simResults || !entries.length) return;
    const result = optimizePortfolio(
      simResults,
      entries,
      settings.overlapPenalty
    );
    setPortfolio(result);
  }, [simResults, entries, settings.overlapPenalty, setPortfolio]);

  const handleExport = useCallback(() => {
    if (!portfolio) return;
    const csv = exportCSV(portfolio);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DKEntries_Optimized_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [portfolio]);

  // Auto-optimize on mount if not yet done
  if (!portfolio && simResults && entries.length) {
    startOptimization();
  }

  return (
    <div className="fade-in space-y-6">
      {!portfolio && (
        <div className="glass-card glow generating rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="font-display font-bold text-xl text-amber-300">
            Optimizing Portfolio...
          </h3>
        </div>
      )}

      {portfolio && (
        <>
          {/* Portfolio assignments */}
          <div className="glass-card glow-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-gray-100">
                Portfolio Assignments
              </h3>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #34d399, #10b981)',
                  color: '#050a18',
                }}
              >
                📥 Export CSV
              </button>
            </div>
            <div className="space-y-4">
              {portfolio.map((a, i) => {
                const overlap =
                  i > 0
                    ? a.result.lineup.filter((p) =>
                        portfolio
                          .slice(0, i)
                          .some((prev) =>
                            prev.result.lineup.some((pp) => pp.id === p.id)
                          )
                      ).length
                    : 0;

                return (
                  <div key={i} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          Entry {i + 1}
                        </span>
                        <p className="text-sm text-gray-300 truncate">
                          {a.entry.contestName}
                        </p>
                        <span className="text-xs text-cyan-400">
                          ${a.entry.entryFee}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-400">
                          {a.result.avgSim.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          proj: {a.result.proj.toFixed(1)} · ceil:{' '}
                          {a.result.ceil.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {a.result.lineup.map((p, j) => {
                        const inOther =
                          i > 0 &&
                          portfolio
                            .slice(0, i)
                            .some((prev) =>
                              prev.result.lineup.some((pp) => pp.id === p.id)
                            );
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
                              inOther
                                ? 'bg-amber-500/10 border border-amber-500/30'
                                : 'bg-white/5'
                            }`}
                          >
                            <PosBadge pos={p.position} />
                            <span className="text-gray-200">{p.name}</span>
                            <span className="text-gray-500">
                              ${(p.salary / 1000).toFixed(1)}K
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {i > 0 && (
                      <div className="text-xs text-gray-500">
                        {overlap} player{overlap !== 1 ? 's' : ''} shared with
                        previous entries{' '}
                        {overlap > settings.overlapPenalty ? '⚠️' : '✓'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Total Entry Fees"
                value={`$${portfolio.reduce((s, a) => s + parseFloat(a.entry.entryFee), 0).toFixed(0)}`}
                color="#fb7185"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Avg Portfolio Sim"
                value={(
                  portfolio.reduce((s, a) => s + a.result.avgSim, 0) /
                  portfolio.length
                ).toFixed(2)}
                color="#a78bfa"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Portfolio Diversity"
                value={`${new Set(portfolio.flatMap((a) => a.result.lineup.map((p) => p.id))).size} players`}
                color="#34d399"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
