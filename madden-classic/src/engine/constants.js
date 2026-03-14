export const SALARY_CAP = 50000;
export const SLOTS = ['QB', 'RB', 'RB', 'WR', 'WR', 'WR', 'TE', 'FLEX', 'DST'];
export const FLEX_ELIGIBLE = ['RB', 'WR', 'TE'];

export const MIN_SALARY = {
  QB: 4000,
  RB: 3000,
  WR: 3000,
  TE: 2500,
  DST: 2500,
  FLEX: 2500,
};

export const POS_COLORS = {
  QB: '#fbbf24',
  RB: '#34d399',
  WR: '#38bdf8',
  TE: '#c084fc',
  DST: '#fb7185',
};

export const SLOT_DEFS = [
  { pos: 'QB', pool: ['QB'] },
  { pos: 'RB', pool: ['RB'] },
  { pos: 'RB', pool: ['RB'] },
  { pos: 'WR', pool: ['WR'] },
  { pos: 'WR', pool: ['WR'] },
  { pos: 'WR', pool: ['WR'] },
  { pos: 'TE', pool: ['TE'] },
  { pos: 'FLEX', pool: ['RB', 'WR', 'TE'] },
  { pos: 'DST', pool: ['DST'] },
];

export function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
