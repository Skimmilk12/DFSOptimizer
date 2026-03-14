import { SALARY_CAP } from './constants.js';

export function findOptimalLineup(players) {
  const viable = players.filter((p) => p.projection > 0);
  const byPos = {};
  viable.forEach((p) => {
    if (!byPos[p.position]) byPos[p.position] = [];
    byPos[p.position].push(p);
  });
  Object.values(byPos).forEach((arr) =>
    arr.sort((a, b) => b.projection - a.projection)
  );

  let best = null;
  let bestProj = 0;

  const qbs = (byPos['QB'] || []).slice(0, 10);
  const rbs = (byPos['RB'] || []).slice(0, 12);
  const wrs = (byPos['WR'] || []).slice(0, 15);
  const tes = (byPos['TE'] || []).slice(0, 10);
  const dsts = (byPos['DST'] || []).slice(0, 6);

  for (const qb of qbs) {
    for (let ri = 0; ri < Math.min(rbs.length, 10); ri++) {
      if (rbs[ri].id === qb.id) continue;
      for (let rj = ri + 1; rj < Math.min(rbs.length, 10); rj++) {
        const rb1 = rbs[ri],
          rb2 = rbs[rj];
        const sal3 = qb.salary + rb1.salary + rb2.salary;
        if (sal3 > SALARY_CAP - 5 * 2500) continue;
        const proj3 = qb.projection + rb1.projection + rb2.projection;
        const usedIds = new Set([qb.id, rb1.id, rb2.id]);

        for (let wi = 0; wi < Math.min(wrs.length, 12); wi++) {
          if (usedIds.has(wrs[wi].id)) continue;
          for (let wj = wi + 1; wj < Math.min(wrs.length, 12); wj++) {
            if (usedIds.has(wrs[wj].id)) continue;
            for (let wk = wj + 1; wk < Math.min(wrs.length, 12); wk++) {
              if (usedIds.has(wrs[wk].id)) continue;
              const wr1 = wrs[wi],
                wr2 = wrs[wj],
                wr3 = wrs[wk];
              const sal6 = sal3 + wr1.salary + wr2.salary + wr3.salary;
              if (sal6 > SALARY_CAP - 3 * 2500) continue;
              const proj6 =
                proj3 + wr1.projection + wr2.projection + wr3.projection;
              if (proj6 + 40 < bestProj) continue;
              const usedIds2 = new Set([
                ...usedIds,
                wr1.id,
                wr2.id,
                wr3.id,
              ]);

              for (const te of tes) {
                if (usedIds2.has(te.id)) continue;
                const sal7 = sal6 + te.salary;
                if (sal7 > SALARY_CAP - 2 * 2500) continue;
                const proj7 = proj6 + te.projection;
                if (proj7 + 20 < bestProj) continue;

                const flexPool = [...rbs, ...wrs, ...tes].filter(
                  (p) => !usedIds2.has(p.id) && p.id !== te.id
                );
                flexPool.sort((a, b) => b.projection - a.projection);

                for (const fl of flexPool.slice(0, 8)) {
                  const sal8 = sal7 + fl.salary;
                  if (sal8 > SALARY_CAP - 2500) continue;
                  const proj8 = proj7 + fl.projection;
                  if (proj8 + 8 < bestProj) continue;
                  const usedIds3 = new Set([...usedIds2, te.id, fl.id]);

                  for (const dst of dsts) {
                    if (usedIds3.has(dst.id)) continue;
                    const salF = sal8 + dst.salary;
                    if (salF > SALARY_CAP) continue;
                    const projF = proj8 + dst.projection;
                    if (projF > bestProj) {
                      bestProj = projF;
                      best = {
                        players: [qb, rb1, rb2, wr1, wr2, wr3, te, fl, dst],
                        projection: projF,
                        salary: salF,
                      };
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return best;
}
