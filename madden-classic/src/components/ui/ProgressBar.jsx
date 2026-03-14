export default function ProgressBar({ value, max, color = '#22d3ee' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className="w-full h-3 rounded-full overflow-hidden"
      style={{ background: '#1e293b' }}
    >
      <div
        className="h-full rounded-full transition-all duration-200"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 12px ${color}66`,
        }}
      />
    </div>
  );
}
