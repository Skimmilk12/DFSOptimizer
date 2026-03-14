import { useState, useMemo } from 'react';
import { POS_COLORS } from '../engine/constants';
import PosBadge from './ui/PosBadge';

export default function PlayerTable({ players }) {
  const [sort, setSort] = useState({ key: 'projection', dir: 'desc' });

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const av =
        sort.key === 'salary'
          ? a.salary
          : sort.key === 'value'
            ? parseFloat(a.value)
            : a.projection;
      const bv =
        sort.key === 'salary'
          ? b.salary
          : sort.key === 'value'
            ? parseFloat(b.value)
            : b.projection;
      return sort.dir === 'desc' ? bv - av : av - bv;
    });
  }, [players, sort]);

  const toggleSort = (key) => {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="font-display font-semibold text-gray-200">
          Player Pool
        </h3>
        <div className="flex gap-2 text-xs">
          {['projection', 'salary', 'value'].map((k) => (
            <button
              key={k}
              onClick={() => toggleSort(k)}
              className={`px-2 py-1 rounded ${
                sort.key === k
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}{' '}
              {sort.key === k ? (sort.dir === 'desc' ? '↓' : '↑') : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase bg-gray-900/80">
              <th className="px-4 py-2 text-left">Pos</th>
              <th className="px-4 py-2 text-left">Player</th>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-right">Salary</th>
              <th className="px-4 py-2 text-right">Proj</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers
              .filter((p) => p.projection > 0)
              .map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-2">
                    <PosBadge pos={p.position} />
                  </td>
                  <td className="px-4 py-2 text-gray-200">{p.name}</td>
                  <td className="px-4 py-2 text-gray-400">{p.team}</td>
                  <td className="px-4 py-2 text-right text-gray-300">
                    ${p.salary.toLocaleString()}
                  </td>
                  <td
                    className="px-4 py-2 text-right font-bold"
                    style={{ color: POS_COLORS[p.position] }}
                  >
                    {p.projection.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-400">
                    {p.value}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
