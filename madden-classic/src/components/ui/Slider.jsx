export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  leftLabel,
  rightLabel,
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-sm font-bold text-cyan-400">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
