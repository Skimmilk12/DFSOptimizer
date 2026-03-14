import { POS_COLORS } from '../../engine/constants';

export default function PosBadge({ pos }) {
  const color = POS_COLORS[pos] || '#64748b';
  return (
    <span
      className="inline-flex items-center justify-center text-xs font-bold rounded px-1.5 py-0.5"
      style={{
        backgroundColor: color + '22',
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {pos}
    </span>
  );
}
