import { SALARY_CAP, MIN_SALARY, SLOT_DEFS, gauss } from './constants.js';

export function generateSingleLineup(players, noise, stacking) {
  const perturbed = {};
  players.forEach((p) => {
    perturbed[p.id] = Math.max(0, p.projection + gauss() * p.projection * noise);
  });

  const byPos = {};
  players.forEach((p) => {
    if (!byPos[p.position]) byPos[p.position] = [];
    byPos[p.position].push(p);
  });

  const lineup = [];
  const usedIds = new Set();
  let remSal = SALARY_CAP;

  const slotsLeft = (fromIdx) => {
    let min = 0;
    for (let i = fromIdx; i < SLOT_DEFS.length; i++) {
      min +=
        SLOT_DEFS[i].pos === 'FLEX'
          ? 2500
          : MIN_SALARY[SLOT_DEFS[i].pos] || 2500;
    }
    return min;
  };

  let qbTeam = null;

  for (let si = 0; si < SLOT_DEFS.length; si++) {
    const slot = SLOT_DEFS[si];
    const minNeeded = slotsLeft(si + 1);
    let pool = [];
    for (const pos of slot.pool) {
      if (byPos[pos]) pool.push(...byPos[pos]);
    }
    pool = pool.filter(
      (p) =>
        !usedIds.has(p.id) &&
        p.salary <= remSal - minNeeded &&
        p.projection > 0
    );

    if (stacking?.qbWr && si >= 3 && si <= 5 && qbTeam) {
      const sameTeam = pool.filter((p) => p.team === qbTeam);
      const hasStackAlready = lineup.some(
        (p) => p.position === 'WR' && p.team === qbTeam
      );
      if (si === 5 && !hasStackAlready && sameTeam.length > 0) {
        pool = sameTeam;
      } else if (si === 3 && sameTeam.length > 0 && Math.random() < 0.6) {
        pool = sameTeam;
      }
    }

    if (pool.length === 0) return null;

    pool.sort(
      (a, b) => perturbed[b.id] / b.salary - perturbed[a.id] / a.salary
    );

    const topK = Math.min(pool.length, si === 0 ? 3 : 4);
    const weights = [];
    for (let i = 0; i < topK; i++) weights.push(Math.pow(0.55, i));
    const totalW = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalW;
    let pick = pool[0];
    for (let i = 0; i < topK; i++) {
      r -= weights[i];
      if (r <= 0) {
        pick = pool[i];
        break;
      }
    }

    lineup.push(pick);
    usedIds.add(pick.id);
    remSal -= pick.salary;
    if (si === 0) {
      qbTeam = pick.team;
    }
  }

  return lineup;
}
