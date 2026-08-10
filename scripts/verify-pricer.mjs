// Verify the Pricer bank (app/pricer/puzzles.js) from scratch.
//
// Structural: nums sequential, quizId/live/dateLabel agree, sunday flag matches
// the real weekday, 16 items on weekdays and 32 on Sundays, names distinct,
// VALUES distinct (a tie makes a matchup unanswerable), every value a positive
// whole number of CENTS, the field a power of two, and the true champion the
// global extreme under the day's direction.
//
// The eight content checks below were added 2026-08-09 after an audit found the
// launch bank shipping fabricated salaries, discontinued products, a price that
// contradicted itself across two boards, and 30 consecutive boards asking the
// same question. Every one of those was mechanically checkable and nobody had
// written the check. Per CLAUDE.md: a rule that is not checked is not a rule.
//
//   1. CROSS-BOARD PRICE CONSISTENCY. The same item name may not carry two
//      different values anywhere in the bank. (A Volvo XC90 was $60,000 on one
//      board and $72,000 on another four days later.)
//   2. basis present and valid, gathered present and a real date, and asOf GONE.
//      Two date fields where one is real and one is decorative is how a board
//      came to be labelled "August 2026" while carrying year-old figures.
//   3. STALENESS. gathered may not be in the future or after live; live may not
//      be more than STALE_FAIL days after gathered, and warns past STALE_WARN.
//      This is what forces a re-gather instead of letting a banked board rot.
//   4. DIRECTION VARIETY. min must be at least MIN_SHARE of the bank and no run
//      of one direction may exceed DIR_RUN. The first bank ran 33 of 35 boards
//      on "which costs MORE", including a run of 30.
//   5. FAMILY CEILING. At most FAM_MAX boards per family, never two within
//      FAM_GAP days. The first bank ran four car boards and three footwear.
//   6. ITEM OVERLAP. Two boards may not share more than OVERLAP_MAX items; a
//      board that is largely a subset of another is not a separate board.
//   7. SHOP LINKS. shop is 'amazon' or 'brand'; an asin is a well-formed
//      10-character ASIN and only appears on an amazon board; a url is https
//      and only appears on a brand board.
//   8. ELIGIBILITY is NOT machine-checkable and is enforced at review: every
//      item must be a thing a person can buy at an observable price.
//
// DIFFICULTY IS ADVISORY. Pricer compares sixteen things WITHIN one category,
// where the middle of the ladder is genuinely compressed, so the 35% line only
// warns. Note that a tight pair is usually harmless anyway: seeding puts ranks
// 7 and 8 in opposite halves of the draw, so they never actually meet.
//
// The board carries no answer: every matchup winner is recomputed here.
// Run: node scripts/verify-pricer.mjs
import { PUZZLES } from '../app/pricer/puzzles.js';

const STALE_WARN = 45, STALE_FAIL = 90;
const MIN_SHARE = 0.15, DIR_RUN = 4;
const FAM_MAX = 2, FAM_GAP = 10;
const OVERLAP_MAX = 3;

let fails = 0, warns = 0;
const fail = (m) => { console.error('FAIL:', m); fails++; };
const warn = (m) => { console.warn('warn:', m); warns++; };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ASIN_RE = /^[A-Z0-9]{10}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BASES = new Set(['msrp', 'street', 'rate', 'delivery']);
const seen = new Set(), championSlots = [], priceIndex = new Map();
const famSeen = new Map(), boardSets = [];
let minCount = 0, dirRun = 1, prevDir = null;

PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.live}, ${p.category})`;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  if (seen.has(p.quizId)) fail(`${tag}: duplicate quizId`);
  seen.add(p.quizId);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `pricer-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live date`);
  if (p.dateLabel !== `${MONTHS[m-1]} ${d}, ${y}`) fail(`${tag}: dateLabel does not match live date`);
  if (!!p.sunday !== (new Date(Date.UTC(y, m-1, d)).getUTCDay() === 0)) fail(`${tag}: sunday flag wrong`);

  const n = p.items.length, want = p.sunday ? 32 : 16;
  if (n !== want) fail(`${tag}: ${n} items (want ${want})`);
  if ((n & (n - 1)) !== 0) fail(`${tag}: field is not a power of two`);
  if (new Set(p.items.map((x) => x.name)).size !== n) fail(`${tag}: duplicate item name`);
  if (new Set(p.items.map((x) => x.value)).size !== n) fail(`${tag}: two items share a value, so a matchup has no answer`);
  if (p.items.some((x) => typeof x.value !== 'number' || !isFinite(x.value) || x.value < 0 || Math.round(x.value) !== x.value)) {
    fail(`${tag}: a price is not a whole number of cents`);
  }
  if (!p.metric || !p.metricShort) fail(`${tag}: missing metric labelling`);
  if (p.unit !== 'usdc') fail(`${tag}: unit is '${p.unit}', every Pricer board is 'usdc' (cents)`);
  if (!p.category) fail(`${tag}: missing category`);
  if (p.dir !== 'max' && p.dir !== 'min') fail(`${tag}: bad direction`);

  // 2. basis / gathered / no asOf
  if (!BASES.has(p.basis)) fail(`${tag}: basis '${p.basis}' is not one of ${[...BASES].join(', ')}`);
  if ('asOf' in p) fail(`${tag}: carries asOf. That field was retired; gathered is the real date`);
  if (!DATE_RE.test(p.gathered || '')) fail(`${tag}: gathered is missing or not YYYY-MM-DD`);
  if (!p.family) fail(`${tag}: missing family`);

  // 3. staleness
  if (DATE_RE.test(p.gathered || '')) {
    const g = Date.parse(p.gathered + 'T00:00:00Z'), l = Date.parse(p.live + 'T00:00:00Z');
    const today = Date.parse(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
    if (g > today) fail(`${tag}: gathered is in the future`);
    if (g > l) fail(`${tag}: gathered is after the live date`);
    const age = Math.round((l - g) / 86400000);
    if (age > STALE_FAIL) fail(`${tag}: goes live ${age} days after it was gathered (max ${STALE_FAIL}). Re-gather.`);
    else if (age > STALE_WARN) warn(`${tag}: goes live ${age} days after it was gathered`);
  }

  // 4. direction variety
  if (p.dir === 'min') minCount++;
  dirRun = p.dir === prevDir ? dirRun + 1 : 1; prevDir = p.dir;
  if (dirRun > DIR_RUN) fail(`${tag}: ${dirRun} boards in a row ask the same direction (max ${DIR_RUN})`);

  // 5. family ceiling
  const prev = famSeen.get(p.family) || [];
  const gapDays = prev.length ? Math.round((Date.parse(p.live) - Date.parse(prev[prev.length-1])) / 86400000) : null;
  if (prev.length + 1 > FAM_MAX) fail(`${tag}: family '${p.family}' appears ${prev.length + 1} times (max ${FAM_MAX})`);
  if (gapDays !== null && gapDays <= FAM_GAP) fail(`${tag}: family '${p.family}' repeats after only ${gapDays} days (min ${FAM_GAP + 1})`);
  famSeen.set(p.family, [...prev, p.live]);

  // 1. cross-board price consistency + 6. overlap bookkeeping
  for (const it of p.items) {
    const prevSeen = priceIndex.get(it.name);
    if (prevSeen && prevSeen.value !== it.value) {
      fail(`${tag}: '${it.name}' is ${it.value} here but ${prevSeen.value} on #${prevSeen.num}. The same thing cannot have two prices.`);
    }
    if (!prevSeen) priceIndex.set(it.name, { value: it.value, num: p.num });
  }
  boardSets.push({ num: p.num, cat: p.category, set: new Set(p.items.map((x) => x.name)) });

  // 7. shop links
  if (p.shop != null && p.shop !== 'amazon' && p.shop !== 'brand') fail(`${tag}: shop is '${p.shop}', expected 'amazon' or 'brand'`);
  for (const it of p.items) {
    if (it.asin != null) {
      if (p.shop !== 'amazon') fail(`${tag}: ${it.name} carries an asin on a board whose shop is '${p.shop}'`);
      if (typeof it.asin !== 'string' || !ASIN_RE.test(it.asin)) fail(`${tag}: ${it.name} has a malformed asin (${it.asin})`);
    }
    if (it.url != null) {
      if (p.shop !== 'brand') fail(`${tag}: ${it.name} carries a url on a board whose shop is '${p.shop}'`);
      if (typeof it.url !== 'string' || !it.url.startsWith('https://')) fail(`${tag}: ${it.name} has a non-https url`);
    }
  }

  // bracket
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

  const rel = (a, b) => { const hi = Math.max(p.items[a].value, p.items[b].value); return hi === 0 ? 1 : Math.abs(p.items[a].value - p.items[b].value) / hi; };
  for (let k = 0; k < n; k += 2) {
    const g = rel(k, k + 1);
    if (g < 0.10) warn(`${tag}: first-round matchup ${k / 2 + 1} is only ${(g * 100).toFixed(1)}% apart, which is a coin flip rather than a warm-up`);
  }
  const finalists = rounds[rounds.length - 2];
  if (rel(finalists[0], finalists[1]) > 0.50) warn(`${tag}: the final is ${(rel(finalists[0], finalists[1]) * 100).toFixed(1)}% apart, which is not much of a final`);

  const perRound = []; let m2 = n;
  for (let r = 0; m2 > 1; r++) { m2 /= 2; perRound.push(m2 * Math.pow(2, r)); }
  if (new Set(perRound).size !== 1) fail(`${tag}: rounds are not worth the same in total`);
});

// 6. item overlap between boards
for (let a = 0; a < boardSets.length; a++) for (let b = a + 1; b < boardSets.length; b++) {
  const shared = [...boardSets[a].set].filter((x) => boardSets[b].set.has(x));
  if (shared.length > OVERLAP_MAX) {
    fail(`#${boardSets[a].num} (${boardSets[a].cat}) and #${boardSets[b].num} (${boardSets[b].cat}) share ${shared.length} items (max ${OVERLAP_MAX}): ${shared.slice(0, 5).join(', ')}`);
  }
}

// 4. direction share
if (minCount / PUZZLES.length < MIN_SHARE) {
  fail(`only ${minCount} of ${PUZZLES.length} boards ask "which costs LESS" (${(minCount / PUZZLES.length * 100).toFixed(0)}%, min ${MIN_SHARE * 100}%)`);
}

// the champion must not sit in the same slot every day, or seed position leaks it
if (new Set(championSlots).size < Math.min(6, PUZZLES.length)) {
  fail(`the champion lands in only ${new Set(championSlots).size} distinct slots across the bank, so position leaks the answer`);
}

if (fails) { console.error(`\nverify-pricer: ${fails} FAILURE(S), ${warns} warning(s)`); process.exit(1); }
console.log(`verify-pricer: all ${PUZZLES.length} boards pass`);
console.log(`  cents, unique prices, true champion, slots scrambled`);
console.log(`  basis + gathered on every board, no asOf, nothing staler than ${STALE_FAIL} days`);
console.log(`  ${minCount}/${PUZZLES.length} boards ask LESS (${(minCount / PUZZLES.length * 100).toFixed(0)}%), longest same-direction run within ${DIR_RUN}`);
console.log(`  no family over ${FAM_MAX}, none repeating inside ${FAM_GAP} days, no cross-board price contradiction`);
if (warns) console.log(`  ${warns} advisory warning(s)`);
