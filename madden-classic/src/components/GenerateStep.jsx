import { useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { POS_COLORS } from '../engine/constants';
import { useWorker } from '../hooks/useWorker';
import Stat from './ui/Stat';
import ProgressBar from './ui/ProgressBar';
import LineupTable from './LineupTable';

const createGeneratorWorker = () =>
  new Worker(
    new URL('../engine/generator.worker.js', import.meta.url),
    { type: 'module' }
  );

export default function GenerateStep({
  players,
  settings,
  optimalLineup,
  projFloor,
  lineups,
  setLineups,
  generating,
  setGenerating,
  genProgress,
  setGenProgress,
  onNext,
}) {
  const { start: startWorker, cancel: cancelWorker } =
    useWorker(createGeneratorWorker);

  const startGeneration = useCallback(() => {
    if (!optimalLineup) return;
    setGenerating(true);
    setLineups([]);
    setGenProgress({ count: 0, attempts: 0 });

    startWorker(
      {
        players,
        settings,
        optimalProjection: optimalLineup.projection,
      },
      (progress) => {
        setGenProgress({ count: progress.count, attempts: progress.attempts });
      },
      (result) => {
        setLineups(result.lineups);
        setGenerating(false);
      }
    );
  }, [optimalLineup, players, settings, startWorker, setGenerating, setLineups, setGenProgress]);

  const handleCancel = useCallback(() => {
    cancelWorker();
    setGenerating(false);
  }, [cancelWorker, setGenerating]);

  const exposure = useMemo(() => {
    if (!lineups.length) return [];
    const counts = {};
    lineups.forEach((lu) =>
      lu.forEach((p) => {
        counts[p.id] = (counts[p.id] || 0) + 1;
      })
    );
    return players
      .filter((p) => counts[p.id])
      .map((p) => ({
        name: p.name,
        position: p.position,
        exposure: ((counts[p.id] || 0) / lineups.length * 100).toFixed(1),
        count: counts[p.id] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [lineups, players]);

  const projDistribution = useMemo(() => {
    if (!lineups.length) return [];
    const projs = lineups.map((lu) =>
      lu.reduce((s, p) => s + p.projection, 0)
    );
    const min = Math.floor(Math.min(...projs));
    const max = Math.ceil(Math.max(...projs));
    const step = Math.max(0.5, (max - min) / 30);
    const buckets = {};
    projs.forEach((p) => {
      const b = (Math.floor(p / step) * step).toFixed(1);
      buckets[b] = (buckets[b] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([k, v]) => ({ proj: parseFloat(k), count: v }))
      .sort((a, b) => a.proj - b.proj);
  }, [lineups]);

  const sortedLineups = useMemo(() => {
    return [...lineups].sort(
      (a, b) =>
        b.reduce((s, p) => s + p.projection, 0) -
        a.reduce((s, p) => s + p.projection, 0)
    );
  }, [lineups]);

  return (
    <div className="fade-in space-y-6">
      {/* Ready state */}
      {!lineups.length && !generating && (
        <div className="glass-card glow rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🔨</div>
          <h3 className="font-display font-bold text-xl text-gray-100 mb-2">
            Ready to Build {settings.lineupCount.toLocaleString()} Lineups
          </h3>
          <p className="text-gray-500 mb-2">
            Floor: {projFloor.toFixed(1)} pts ({settings.floorPct}% of optimal{' '}
            {optimalLineup?.projection.toFixed(1)})
          </p>
          <p className="text-gray-600 text-sm mb-6">
            Noise: {(settings.noiseFactor * 100).toFixed(0)}% · Min Salary: $
            {settings.minSalary.toLocaleString()} · Stacking:{' '}
            {settings.qbWrStack ? 'QB+WR' : 'Off'}
          </p>
          <button
            onClick={startGeneration}
            className="px-8 py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              color: '#050a18',
            }}
          >
            Generate Lineups
          </button>
        </div>
      )}

      {/* Generating state */}
      {generating && (
        <div className="glass-card glow generating rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="font-display font-bold text-xl text-cyan-300 mb-4">
            Building Lineups...
          </h3>
          <div className="max-w-lg mx-auto mb-4">
            <ProgressBar
              value={genProgress.count}
              max={settings.lineupCount}
            />
          </div>
          <div className="flex justify-center gap-8 mb-4">
            <Stat
              label="Valid Lineups"
              value={genProgress.count.toLocaleString()}
              color="#22d3ee"
            />
            <Stat
              label="Attempts"
              value={genProgress.attempts.toLocaleString()}
              color="#94a3b8"
            />
            <Stat
              label="Hit Rate"
              value={
                genProgress.attempts > 0
                  ? `${((genProgress.count / genProgress.attempts) * 100).toFixed(1)}%`
                  : '—'
              }
              color="#34d399"
            />
          </div>
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg text-sm font-display font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Results state */}
      {lineups.length > 0 && !generating && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Lineups Built"
                value={lineups.length.toLocaleString()}
                color="#22d3ee"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Avg Projection"
                value={(
                  lineups.reduce(
                    (s, lu) => s + lu.reduce((a, p) => a + p.projection, 0),
                    0
                  ) / lineups.length
                ).toFixed(2)}
                color="#34d399"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Max Projection"
                value={Math.max(
                  ...lineups.map((lu) =>
                    lu.reduce((s, p) => s + p.projection, 0)
                  )
                ).toFixed(2)}
                color="#fbbf24"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Unique Players"
                value={new Set(lineups.flat().map((p) => p.id)).size}
                color="#c084fc"
              />
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-xl p-4">
              <h4 className="font-display font-semibold text-gray-300 mb-3">
                Projection Distribution
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={projDistribution}>
                  <defs>
                    <linearGradient
                      id="projGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22d3ee"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor="#22d3ee"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="proj"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#e2e8f0',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#22d3ee"
                    fill="url(#projGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h4 className="font-display font-semibold text-gray-300 mb-3">
                Top Player Exposure
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={exposure.slice(0, 12)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#e2e8f0',
                    }}
                    formatter={(v) => [`${v}%`, 'Exposure']}
                  />
                  <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                    {exposure.slice(0, 12).map((e, i) => (
                      <Cell
                        key={i}
                        fill={POS_COLORS[e.position] || '#64748b'}
                        fillOpacity={0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lineup browser */}
          <LineupTable lineups={sortedLineups} />

          {/* Continue button */}
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              color: '#050a18',
            }}
          >
            Continue to Simulate →
          </button>
        </>
      )}
    </div>
  );
}
