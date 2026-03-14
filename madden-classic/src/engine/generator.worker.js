import { generateSingleLineup } from './generator.js';

self.onmessage = function (e) {
  const { players, settings, optimalProjection } = e.data;
  const floor = (optimalProjection * settings.floorPct) / 100;
  const target = settings.lineupCount;
  const noise = settings.noiseFactor;
  const stacking = { qbWr: settings.qbWrStack };
  const results = [];
  const seen = new Set();
  let attempts = 0;
  const maxAttempts = target * 50;
  const batchSize = 200;

  function batch() {
    const batchEnd = Math.min(attempts + batchSize, maxAttempts);
    while (attempts < batchEnd && results.length < target) {
      attempts++;
      const lu = generateSingleLineup(players, noise, stacking);
      if (!lu) continue;
      const proj = lu.reduce((s, p) => s + p.projection, 0);
      if (proj < floor) continue;
      const sal = lu.reduce((s, p) => s + p.salary, 0);
      if (sal < settings.minSalary) continue;
      const key = lu
        .map((p) => p.id)
        .sort()
        .join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(lu);
    }

    self.postMessage({
      type: 'progress',
      count: results.length,
      attempts,
    });

    if (results.length >= target || attempts >= maxAttempts) {
      self.postMessage({ type: 'done', lineups: results, attempts });
    } else {
      setTimeout(batch, 0);
    }
  }

  setTimeout(batch, 0);
};
