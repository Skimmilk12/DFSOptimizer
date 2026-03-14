import { gauss } from './constants.js';

const POS_VARIANCE = { QB: 0.30, RB: 0.35, WR: 0.35, TE: 0.35, DST: 0.50 };

export function runSimulationBatch(players, lineups, games, startSim, endSim, lineupScores) {
  for (let s = startSim; s < endSim; s++) {
    const gameFactor = {};
    games.forEach((g) => {
      gameFactor[g] = 1 + gauss() * 0.15;
    });

    const pScores = {};
    players.forEach((p) => {
      const gf = gameFactor[p.gameInfo] || 1;
      const posVar = POS_VARIANCE[p.position] || 0.35;
      pScores[p.id] = Math.max(
        0,
        p.projection * gf + gauss() * p.projection * posVar
      );
    });

    lineups.forEach((lu, li) => {
      lineupScores[li].push(
        lu.reduce((sum, p) => sum + pScores[p.id], 0)
      );
    });
  }
}

export function computeSimMetrics(lineups, lineupScores) {
  return lineups.map((lu, i) => {
    const scores = lineupScores[i].slice().sort((a, b) => a - b);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const p10 = scores[Math.floor(scores.length * 0.1)];
    const p90 = scores[Math.floor(scores.length * 0.9)];
    const ceil = scores[Math.floor(scores.length * 0.95)];
    const floor = scores[Math.floor(scores.length * 0.05)];
    const proj = lu.reduce((s, p) => s + p.projection, 0);
    const sal = lu.reduce((s, p) => s + p.salary, 0);
    return { idx: i, lineup: lu, proj, sal, avgSim: avg, floor, ceil, p10, p90 };
  });
}
