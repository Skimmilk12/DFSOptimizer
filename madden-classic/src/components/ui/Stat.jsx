export default function Stat({ label, value, sub, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color: color || '#e2e8f0' }}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}
