export default function Header({ fileName }) {
  return (
    <header className="glass" style={{ borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #3b82f6)' }}
          >
            🎮
          </div>
          <div>
            <h1
              className="font-display font-bold text-lg tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Madden Classic Builder
            </h1>
            <p className="text-xs text-gray-500 -mt-0.5">
              DraftKings Lineup Optimization Engine
            </p>
          </div>
        </div>
        {fileName && (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {fileName}
          </div>
        )}
      </div>
    </header>
  );
}
