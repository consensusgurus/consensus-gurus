// Verify the Pricer bank (app/pricer/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, 16 items on weekdays and 32 on Sundays, names
//     distinct, VALUES distinct (a tie would make a matchup unanswerable), every
//     value a positive finite number of whole dollars
//   - every board carries `asOf`. A price is only true on a date, so a Pricer
//     board without one is unfinished, not merely undecorated. HARD FAIL.
//   - the field is a power of two and the bracket resolves cleanly
//   - the true champion is the global extreme under the day's direction
//   - seed position must not leak the answer: the champion is not always in the
//     same slot across the bank (the bank generator scrambles siblings, which is
//     a bracket automorphism, so this passes without changing who meets whom)
//   - `amazon` boards: the flag is a real boolean and any per-item `asin` is a
//     well-formed 10-character ASIN. ASINs are optional and absent at launch.
//
// DIFFICULTY IS ADVISORY HERE, unlike Bracket. Bracket hard-fails a first-round
// matchup closer than 35%, but Bracket compares things across whole categories
// (a country against a lake). Pricer compares sixteen things WITHIN one category,
// where the middle of the ladder is genuinely compressed: the 8th and 9th most
// expensive sneakers are never 35% apart and pretending otherwise would mean
// inventing prices. So the 35% line only WARNS, and only a matchup under 10%
// (which is a coin flip, not a warm-up) or a final over 50% (which is no final at
// all) is worth a second look. Nothing about the curve fails the build.
//
// The board carries no answer: the winner of every matchup is recomputed here
// from the values, exactly as the client recomputes it.
// Run: node scripts/verify-pricer.mjs
import { PUZZLES } from '../app/pricer/puzzles.js';

let fails = 0, warns = 0;
const fail = (m) => { console.error('FAIL:', m); fails++; };
const warn = (m) => { console.warn('warn:', m); warns++; };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ASIN_RE = /^[A-Z0-9]{10}$/;
const seen = new Set();
const championSlots = [];

PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.live}, ${p.category})`;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  if (seen.has(p.quizId)) fail(`${tag}: duplicate quizId`);
  seen.add(p.quizId);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `pricer-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live date`);
  if (p.dateLabel !== `${MONTHS[m-1]} ${d}, ${y}`) fail(`${tag}: dateLabel does not match live date`);
  if (!!p.sunday !== (new Date(Date.UTC(y, m-1, d)).getUTCDay() === 0)) fail(`${tag}: sunday flag wrong`);

  const n = p.items.length;
  const want = p.sunday ? 32 : 16;
  if (n !== want) fail(`${tag}: ${n} items (want ${want})`);
  if ((n & (n - 1)) !== 0) fail(`${tag}: field is not a power of two`);
  if (new Set(p.items.map((x) => x.name)).size !== n) fail(`${tag}: duplicate item name`);
  if (new Set(p.items.map((x) => x.value)).size !== n) fail(`${tag}: two items share a value, so a matchup has no answer`);
  if (p.items.some((x) => typeof x.value !== 'number' || !isFinite(x.value) || x.value <= 0 || Math.round(x.value) !== x.value)) {
    fail(`${tag}: a price is not a positive whole number of dollars`);
  }
  if (!p.metric || !p.metricShort || !p.unit) fail(`${tag}: missing metric labelling`);
  if (p.unit !== 'usd') fail(`${tag}: unit is '${p.unit}', every Pricer board is 'usd'`);
  if (!p.category) fail(`${tag}: missing category`);
  if (!p.asOf) fail(`${tag}: no asOf. A price is only true on a date`);
  if (p.dir !== 'max' && p.dir !== 'min') fail(`${tag}: bad direction`);

  if ('amazon' in p && typeof p.amazon !== 'boolean') fail(`${tag}: amazon flag is not a boolean`);
  for (const it of p.items) {
    if (it.asin == null) continue;
    if (!p.amazon) fail(`${tag}: ${it.name} carries an asin on a board that is not flagged amazon`);
    if (typeof it.asin !== 'string' || !ASIN_RE.test(it.asin)) fail(`${tag}: ${it.name} has a malformed asin (${it.asin})`);
  }

  const better = (a, b) => (p.dir === 'max' ? p.items[a].value > p.items[b].value : p.items[a].value < p.items[b].value) ? a : b;
  let live = p.items.map((_, k) => k);
  const rounds = [];
  while (live.length > 1) {
    const next = [];
    for (let k = 0; k < live.length; k += 2) next.push(better(live[k], live[k + 1]));
    rounds.push(next); live = next;
  }
  const champ = live[0];
  championSlots.push(champ);

  const extreme = p.items.reduce((best, it, k) => (p.dir === 'max' ? it.value > p.items[best].value : it.value < p.items[best].value) ? k : best, 0);
  if (champ !== extreme) fail(`${tag}: the bracket champion is not the true extreme, so the seeding is broken`);

  // curve: routs first, coin flip last. ADVISORY (see the header).
  const rel = (a, b) => Math.abs(p.items[a].value - p.items[b].value) / Math.max(p.items[a].value, p.items[b].value);
  for (let k = 0; k < n; k += 2) {
    const g = rel(k, k + 1);
    if (g < 0.10) warn(`${tag}: first-round matchup ${k / 2 + 1} is only ${(g * 100).toFixed(1)}% apart, which is a coin flip rather than a warm-up`);
    else if (g < 0.35) warn(`${tag}: first-round matchup ${k / 2 + 1} is ${(g * 100).toFixed(1)}% apart (under the 35% Bracket floor; expected in a single-category price ladder)`);
  }
  const finalists = rounds[rounds.length - 2];
  const fg = rel(finalists[0], finalists[1]);
  if (fg > 0.50) warn(`${tag}: the final is ${(fg * 100).toFixed(1)}% apart, which is not much of a final`);

  // scoring shape: every round is worth the same in total
  const perRound = [];
  let m2 = n;
  for (let r = 0; m2 > 1; r++) { m2 /= 2; perRound.push(m2 * Math.pow(2, r)); }
  if (new Set(perRound).size !== 1) fail(`${tag}: rounds are not worth the same in total`);
  if (perRound[0] !== n / 2) fail(`${tag}: round total is not half the field`);
});

// the champion must not sit in the same slot every day, or seed position leaks it
if (new Set(championSlots).size < Math.min(6, PUZZLES.length)) {
  fail(`the champion lands in only ${new Set(championSlots).size} distinct slots across the bank, so position leaks the answer`);
}

if (fails) { console.error(`\nverify-pricer: ${fails} FAILURE(S), ${warns} warning(s)`); process.exit(1); }
console.log(`verify-pricer: all ${PUZZLES.length} boards pass (unique prices, true champion, asOf on every board, slots scrambled)${warns ? `, ${warns} advisory warning(s)` : ''}`);
