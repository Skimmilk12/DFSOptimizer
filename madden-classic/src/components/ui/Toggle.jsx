export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative" onClick={() => onChange(!checked)}>
        <div
          className={`w-10 h-5 rounded-full transition-colors ${
            checked ? 'bg-cyan-500' : 'bg-gray-700'
          }`}
        />
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
          style={{
            transform: checked ? 'translateX(22px)' : 'translateX(2px)',
            transition: 'transform 0.2s',
          }}
        />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}
