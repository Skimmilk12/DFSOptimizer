export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((l) => {
    const result = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < l.length; i++) {
      if (l[i] === '"') {
        inQ = !inQ;
      } else if (l[i] === ',' && !inQ) {
        result.push(cur);
        cur = '';
      } else {
        cur += l[i];
      }
    }
    result.push(cur);
    return result;
  });

  const entries = [];
  const players = [];
  let playerHeaderIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i];
    if (i === 0) continue;

    if (row[0] && row[0].trim()) {
      entries.push({
        entryId: row[0].trim(),
        contestName: row[1]?.trim(),
        contestId: row[2]?.trim(),
        entryFee: row[3]?.replace('$', '').trim(),
        currentLineup: row
          .slice(4, 13)
          .map((s) => s?.trim())
          .filter(Boolean),
      });
    }

    if (row.length >= 23 && row[14]?.trim() === 'Position') {
      playerHeaderIdx = i;
      continue;
    }

    if (
      row.length >= 23 &&
      playerHeaderIdx > -1 &&
      row[14]?.trim() &&
      row[14]?.trim() !== 'Position'
    ) {
      const proj = parseFloat(row[22]) || 0;
      players.push({
        position: row[14].trim(),
        nameId: row[15]?.trim(),
        name: row[16]?.trim(),
        id: row[17]?.trim(),
        rosterPos: row[18]?.trim(),
        salary: parseInt(row[19]) || 0,
        gameInfo: row[20]?.trim(),
        team: row[21]?.trim(),
        projection: proj,
        value:
          proj > 0 && parseInt(row[19]) > 0
            ? (proj / parseInt(row[19]) * 1000).toFixed(2)
            : '0.00',
      });
    }
  }

  return { entries, players };
}
