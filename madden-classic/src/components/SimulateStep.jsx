import { useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useWorker } from '../hooks/useWorker';
import Stat from './ui/Stat';
import ProgressBar from './ui/ProgressBar';
import LineupTable from './LineupTable';

const createSimulatorWorker = () =>
  new Worker(
    new URL('../engine/simulator.worker.js', import.meta.url),
    { type: 'module' }
  );

export default function SimulateStep({
  players,
  lineups,
  settings,
  simResults,
  setSimResults,
  simulating,
  setSimulating,
  simProgress,
  setSimProgress,
  onNext,
}) {
  const { start: startWorker, cancel: cancelWorker } =
    useWorker(createSimulatorWorker);

  const startSimulation = useCallback(() => {
    if (!lineups.length) return;
    setSimulating(true);
    setSimProgress(0);

    startWorker(
      { players, lineups, simCount: settings.simCount },
      (data) => setSimProgress(data.progress),
      (data) => {
        setSimResults(data.results);
        setSimulating(false);
      }
    );
  }, [lineups, players, settings.simCount, startWorker, setSimulating, setSimProgress, setSimResults]);

  const handleCancel = useCallback(() => {
    cancelWorker();
    setSimulating(false);
  }, [cancelWorker, setSimulating]);

  return (
    <div className="fade-in space-y-6">
      {/* Ready state */}
      {!simResults && !simulating && (
        <div className="glass-card glow rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🎲</div>
          <h3 className="font-display font-bold text-xl text-gray-100 mb-2">
            Monte Carlo Contest Simulation
          </h3>
          <p className="text-gray-500 mb-6">
            {settings.simCount.toLocaleString()} simulations ×{' '}
            {lineups.length.toLocaleString()} lineups
          </p>
          <button
            onClick={startSimulation}
            className="px-8 py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
              color: '#fff',
            }}
          >
            Run Simulation
          </button>
        </div>
      )}

      {/* Simulating state */}
      {simulating && (
        <div className="glass-card glow generating rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🎲</div>
          <h3 className="font-display font-bold text-xl text-purple-300 mb-4">
            Simulating Outcomes...
          </h3>
          <div className="max-w-lg mx-auto mb-4">
            <ProgressBar value={simProgress} max={100} color="#a78bfa" />
          </div>
          <p className="text-gray-400 mb-4">{simProgress.toFixed(0)}% complete</p>
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg text-sm font-display font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Results state */}
      {simResults && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Best Avg Sim"
                value={simResults[0]?.avgSim.toFixed(2)}
                color="#a78bfa"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Best Ceiling"
                value={Math.max(...simResults.map((r) => r.ceil)).toFixed(2)}
                color="#fbbf24"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Best Floor"
                value={Math.max(...simResults.map((r) => r.floor)).toFixed(2)}
                color="#34d399"
              />
            </div>
            <div className="glass-card rounded-xl p-4">
              <Stat
                label="Avg Spread"
                value={(
                  simResults.reduce((s, r) => s + (r.p90 - r.p10), 0) /
                  simResults.length
                ).toFixed(2)}
                color="#fb7185"
                sub="P90 - P10"
              />
            </div>
          </div>

          {/* Score distribution chart */}
          <div className="glass-card rounded-xl p-4">
            <h4 className="font-display font-semibold text-gray-300 mb-3">
              Simulated Score Distribution (Top 50 Lineups)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={simResults.slice(0, 50).map((r, i) => ({
                  idx: i + 1,
                  avg: parseFloat(r.avgSim.toFixed(1)),
                  floor: parseFloat(r.floor.toFixed(1)),
                  ceil: parseFloat(r.ceil.toFixed(1)),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="idx"
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
                <Bar
                  dataKey="floor"
                  fill="#334155"
                  radius={[2, 2, 0, 0]}
                  name="Floor (P5)"
                />
                <Bar
                  dataKey="avg"
                  fill="#a78bfa"
                  radius={[2, 2, 0, 0]}
                  name="Avg Sim"
                />
                <Bar
                  dataKey="ceil"
                  fill="#fbbf24"
                  radius={[2, 2, 0, 0]}
                  name="Ceiling (P95)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lineup table with sim stats */}
          <LineupTable
            lineups={simResults.slice(0, 100)}
            showSimStats={true}
          />

          {/* Continue button */}
          <button
            onClick={onNext}
            className="w-full py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#050a18',
            }}
          >
            Optimize Portfolio & Export →
          </button>
        </>
      )}
    </div>
  );
}
