import { useState } from 'react';
import { SLOTS } from '../engine/constants';

export default function LineupTable({ lineups, showSimStats = false }) {
  const [page, setPage] = useState(0);
  const perPage = 50;
  const totalPages = Math.ceil(lineups.length / perPage);

  const pageData = lineups.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h4 className="font-display font-semibold text-gray-200">
          {showSimStats ? 'Simulated Lineups' : 'Lineup Browser'}
        </h4>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">
            Page {page + 1}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white"
          >
            ←
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="px-2 py-1 rounded bg-white/5 text-gray-400 hover:text-white"
          >
            →
          </button>
        </div>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase bg-gray-900/80">
              <th className="px-3 py-2 text-left">
                {showSimStats ? 'Rank' : '#'}
              </th>
              {SLOTS.map((s, i) => (
                <th key={i} className="px-3 py-2 text-left">
                  {s}
                </th>
              ))}
              <th className="px-3 py-2 text-right">Proj</th>
              {showSimStats ? (
                <>
                  <th className="px-3 py-2 text-right">Sim Avg</th>
                  <th className="px-3 py-2 text-right">Ceil</th>
                  <th className="px-3 py-2 text-right">Floor</th>
                </>
              ) : (
                <th className="px-3 py-2 text-right">Sal</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, i) => {
              const lu = showSimStats ? item.lineup : item;
              const proj = showSimStats
                ? item.proj
                : lu.reduce((s, p) => s + p.projection, 0);
              const sal = showSimStats
                ? item.sal
                : lu.reduce((s, p) => s + p.salary, 0);

              return (
                <tr
                  key={i}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-3 py-1.5 text-gray-500">
                    {page * perPage + i + 1}
                  </td>
                  {lu.map((p, j) => (
                    <td key={j} className="px-3 py-1.5">
                      <span className="text-gray-300">
                        {p.name.split(' ').pop()}
                      </span>
                      <span className="text-gray-600 ml-1">
                        {p.projection.toFixed(1)}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-1.5 text-right font-bold text-cyan-400">
                    {proj.toFixed(1)}
                  </td>
                  {showSimStats ? (
                    <>
                      <td className="px-3 py-1.5 text-right font-bold text-purple-400">
                        {item.avgSim.toFixed(1)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-amber-400">
                        {item.ceil.toFixed(1)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-gray-500">
                        {item.floor.toFixed(1)}
                      </td>
                    </>
                  ) : (
                    <td className="px-3 py-1.5 text-right text-gray-400">
                      ${(sal / 1000).toFixed(1)}K
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
