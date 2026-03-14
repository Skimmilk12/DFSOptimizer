export function optimizePortfolio(simResults, entries, maxOverlap) {
  const byContest = {};
  entries.forEach((e) => {
    if (!byContest[e.contestId]) byContest[e.contestId] = [];
    byContest[e.contestId].push(e);
  });

  const assignments = [];

  Object.entries(byContest).forEach(([, contestEntries]) => {
    const assigned = [];

    for (const entry of contestEntries) {
      let bestIdx = -1;
      let bestScore = -Infinity;

      simResults.forEach((r, ri) => {
        if (assigned.some((a) => a.lineupIdx === ri)) return;

        let penalty = 0;
        assigned.forEach((a) => {
          const overlap = r.lineup.filter((p) =>
            a.lineup.some((ap) => ap.id === p.id)
          ).length;
          if (overlap > maxOverlap) penalty += (overlap - maxOverlap) * 3;
        });

        const score = r.avgSim - penalty;
        if (score > bestScore) {
          bestScore = score;
          bestIdx = ri;
        }
      });

      if (bestIdx >= 0) {
        assigned.push({
          ...simResults[bestIdx],
          entryId: entry.entryId,
          contestName: entry.contestName,
          lineupIdx: bestIdx,
        });
        assignments.push({
          entry,
          result: simResults[bestIdx],
          lineupIdx: bestIdx,
        });
      }
    }
  });

  return assignments;
}

export function exportCSV(portfolio) {
  let csv =
    'Entry ID,Contest Name,Contest ID,Entry Fee,QB,RB,RB,WR,WR,WR,TE,FLEX,DST\n';

  portfolio.forEach(({ entry, result }) => {
    const lu = result.lineup;
    const qb = lu.find((p) => p.position === 'QB');
    const rbs = lu.filter((p) => p.position === 'RB');
    const wrs = lu.filter((p) => p.position === 'WR');
    const tes = lu.filter((p) => p.position === 'TE');
    const dsts = lu.filter((p) => p.position === 'DST');

    const rbSlots = rbs.slice(0, 2);
    const wrSlots = wrs.slice(0, 3);
    const teSlot = tes[0];
    const dstSlot = dsts[0];

    const usedInMain = new Set([
      qb?.id,
      ...rbSlots.map((p) => p.id),
      ...wrSlots.map((p) => p.id),
      teSlot?.id,
      dstSlot?.id,
    ]);
    const flex = lu.find((p) => !usedInMain.has(p.id));

    const row = [
      entry.entryId,
      entry.contestName,
      entry.contestId,
      `$${entry.entryFee}`,
      qb?.nameId || '',
      rbSlots[0]?.nameId || '',
      rbSlots[1]?.nameId || '',
      wrSlots[0]?.nameId || '',
      wrSlots[1]?.nameId || '',
      wrSlots[2]?.nameId || '',
      teSlot?.nameId || '',
      flex?.nameId || '',
      dstSlot?.nameId || '',
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}
