// Generates the Calc bank. Time-boxed and checkpointed: run it repeatedly and it
// resumes, because a hard Saturday can take a minute of searching on its own.
//
//   node --stack-size=12000 scripts/gen-calc.mjs <from YYYY-MM-DD> <days> <startNum> [seconds]
//
// Difficulty is TWO dials, and neither is the grid alone:
//   routes  how many of the board's legal routes hit the target. This is the
//           main ramp: 100-ish on a Monday, 2 on a Saturday.
//   minLen  the length of the SHORTEST route that hits it. Capped per weekday,
//           because without a cap the search happily returns unique targets that
//           need a 27-button snake, which no player will ever find by hand.
// Sunday is the Edition: THREE targets on the one board, easiest first.
import fs from 'fs';
import { enumerate, solveFor } from './calc-core.mjs';

const OPS = ['+', '-', '*', '/'];
const rnd = (a) => a[(Math.random() * a.length) | 0];
const mkBoard = (n) => {
  const v = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
    v.push((r + c) % 2 === 0 ? String(1 + ((Math.random() * 9) | 0)) : rnd(OPS));
  return v;
};
// A 7x7 past this many routes is dense enough that every target has hundreds of
// solutions, so it is useless AND slow. Rejecting early costs a fraction of a second.
const CAP = { 6: 1500000, 7: 400000 };
// weekday index (0=Sun) -> { n, bands: [[minRoutes, maxRoutes, maxShortest], ...] }
export const SPEC = {
  1: { n: 6, bands: [[40, 400, 13]] },
  2: { n: 6, bands: [[15, 39, 13]] },
  3: { n: 6, bands: [[5, 14, 15]] },
  4: { n: 7, bands: [[25, 300, 15]] },
  5: { n: 7, bands: [[8, 24, 17]] },
  6: { n: 7, bands: [[2, 7, 17]] },
  0: { n: 7, bands: [[25, 300, 17], [8, 24, 19], [1, 4, 19]] },
};
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtLabel = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
const fmtQuiz = (d) => `calc-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
const iso = (d) => d.toISOString().slice(0, 10);

const [from, daysArg, startNumArg, secsArg] = process.argv.slice(2);
const DAYS = +daysArg || 30, START = +startNumArg || 1, SECS = +secsArg || 95;
const FILE = 'bank.json';
const bank = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
const DEADLINE = Date.now() + SECS * 1000;

for (let k = 0; k < DAYS; k++) {
  const d = new Date(Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10)));
  d.setUTCDate(d.getUTCDate() + k);
  const key = iso(d);
  if (bank[key]) continue;
  if (Date.now() > DEADLINE) { fs.writeFileSync(FILE, JSON.stringify(bank)); console.log(`TIMEBOX at ${key}, ${Object.keys(bank).length} banked`); process.exit(0); }
  const dow = d.getUTCDay(), { n, bands } = SPEC[dow];
  let tries = 0, dense = 0; const t0 = Date.now();
  for (;;) {
    if (Date.now() > DEADLINE) { fs.writeFileSync(FILE, JSON.stringify(bank)); console.log(`TIMEBOX mid-${key} after ${tries} boards, ${Object.keys(bank).length} banked`); process.exit(0); }
    tries++;
    const cells = mkBoard(n);
    let res; try { res = enumerate(n, cells, CAP[n]); } catch (e) { dense++; continue; }
    if (res.routes < 800) continue;
    const ent = [...res.totals.entries()].filter(([t]) => t >= 12 && t <= 999);
    const picks = []; const used = new Set(); let ok = true;
    for (const [lo, hi, maxLen] of bands) {
      const c = ent.filter(([t, x]) => !used.has(t) && x.count >= lo && x.count <= hi && x.minLen <= maxLen && x.minLen >= 9);
      if (!c.length) { ok = false; break; }
      const p = c[(Math.random() * c.length) | 0]; picks.push(p); used.add(p[0]);
    }
    if (!ok) continue;
    const targets = picks.map(([target, x]) => {
      const s = solveFor(n, cells, target);
      if (s.count !== x.count || s.best.length !== x.minLen) throw new Error('solver disagrees on ' + target);
      return { target, routes: s.count, minLen: s.best.length, path: s.best };
    }).sort((a, b) => b.routes - a.routes);
    bank[key] = {
      num: START + k, quizId: fmtQuiz(d), live: key, dateLabel: fmtLabel(d),
      sunday: dow === 0, n, cells, boardRoutes: res.routes, targets,
    };
    console.log(`${key} ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]} n=${n} routes=${res.routes} ` +
      targets.map((t) => `${t.target}[${t.routes}/${t.minLen}]`).join(' ') + ` boards=${tries} dense=${dense} ${Date.now() - t0}ms`);
    fs.writeFileSync(FILE, JSON.stringify(bank));
    break;
  }
}
fs.writeFileSync(FILE, JSON.stringify(bank));
console.log(`ALL DONE — ${Object.keys(bank).length} boards banked`);
