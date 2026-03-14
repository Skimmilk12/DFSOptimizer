import Toggle from './ui/Toggle';
import Slider from './ui/Slider';

export default function ConfigureStep({
  settings,
  setSettings,
  optimalLineup,
  projFloor,
  onNext,
}) {
  const set = (key) => (val) =>
    setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div className="fade-in space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Generation settings */}
        <div className="glass-card glow rounded-2xl p-6 space-y-6">
          <h3 className="font-display font-bold text-lg text-gray-100">
            Lineup Generation
          </h3>

          {/* Lineup Count */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Lineup Count</label>
              <span className="text-sm font-bold text-cyan-400">
                {settings.lineupCount.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              {[2000, 5000, 10000, 25000, 50000].map((n) => (
                <button
                  key={n}
                  onClick={() => set('lineupCount')(n)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    settings.lineupCount === n
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'
                  }`}
                >
                  {n >= 1000 ? `${n / 1000}K` : n}
                </button>
              ))}
            </div>
          </div>

          {/* Projection Floor */}
          <Slider
            label="Projection Floor"
            value={settings.floorPct}
            onChange={set('floorPct')}
            min={90}
            max={98}
            step={0.5}
            format={(v) => (
              <>
                {v}%
                {optimalLineup && (
                  <span className="text-xs text-gray-500 ml-2">
                    ≥ {projFloor.toFixed(1)} pts
                  </span>
                )}
              </>
            )}
            leftLabel="90% (diverse)"
            rightLabel="98% (tight)"
          />

          {/* Randomization */}
          <Slider
            label="Randomization"
            value={settings.noiseFactor * 100}
            onChange={(v) => set('noiseFactor')(v / 100)}
            min={10}
            max={60}
            step={1}
            format={(v) => `${v.toFixed(0)}%`}
            leftLabel="10% (chalk)"
            rightLabel="60% (volatile)"
          />

          {/* Min Salary */}
          <Slider
            label="Min Salary Used"
            value={settings.minSalary}
            onChange={set('minSalary')}
            min={46000}
            max={50000}
            step={500}
            format={(v) => `$${v.toLocaleString()}`}
          />
        </div>

        {/* Right column: Stacking + Simulation */}
        <div className="space-y-6">
          <div className="glass-card glow rounded-2xl p-6 space-y-5">
            <h3 className="font-display font-bold text-lg text-gray-100">
              Stacking Rules
            </h3>
            <Toggle
              checked={settings.qbWrStack}
              onChange={set('qbWrStack')}
              label="QB + WR same team"
            />
            <Toggle
              checked={settings.bringBack}
              onChange={set('bringBack')}
              label="Bring-back (opposing player)"
            />
          </div>

          <div className="glass-card glow rounded-2xl p-6 space-y-5">
            <h3 className="font-display font-bold text-lg text-gray-100">
              Simulation
            </h3>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Simulations</label>
                <span className="text-sm font-bold text-cyan-400">
                  {settings.simCount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                {[500, 1000, 2500, 5000].map((n) => (
                  <button
                    key={n}
                    onClick={() => set('simCount')(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      settings.simCount === n
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'
                    }`}
                  >
                    {n >= 1000 ? `${n / 1000}K` : n}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label="Max Player Overlap (Portfolio)"
              value={settings.overlapPenalty}
              onChange={set('overlapPenalty')}
              min={2}
              max={7}
              step={1}
              leftLabel="2 (aggressive)"
              rightLabel="7 (relaxed)"
            />
          </div>

          {optimalLineup && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⚡</div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Optimal Projection
                  </p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {optimalLineup.projection.toFixed(2)}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Floor ({settings.floorPct}%)
                  </p>
                  <p className="text-2xl font-bold text-amber-400">
                    {projFloor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl font-display font-bold text-lg transition-all hover:scale-[1.01]"
        style={{
          background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
          color: '#050a18',
        }}
      >
        Continue to Generate →
      </button>
    </div>
  );
}
