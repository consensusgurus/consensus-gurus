// Lode — daily board generator.
//
// Lode is the open-ended letter hunt: seven letters, one CORE letter that every
// word must use, minimum four letters, letters reusable. A word using all seven
// is a PANGRAM.
//
// The Source of Truths twist is that points come from RARITY, not just length.
// Every scored word carries a tier derived from its real-world usage frequency
// (Zipf scale, computed offline by scripts/lode-words.py), so knowing one
// uncommon word beats grinding ten obvious ones:
//
//   base      = length - 2          (4 letters = 2 ... 8 letters = 6)
//   multiplier= 1 / 2 / 3           (common / uncommon / rare)
//   pangram   = +10
//
// The same frequency data doubles as the junk filter: the shipped dictionary
// (public/tuck-dict.txt) is a Scrabble word list full of words no human knows,
// so anything below the Zipf floor is dropped from the board entirely. Every
// word on a Lode board is a word a reader could plausibly recognise.
//
// Each day carries a VEIN: the target score that counts the day as solved, set
// at a fixed share of the board's maximum. Ranks below it give the ladder
// something to climb, and MOTHER LODE (every word) is there for the obsessives.
//
// Usage:
//   python3 scripts/lode-words.py > scripts/.lode-freq.json   (once, or to refresh)
//   node scripts/gen-lode.mjs --from 2026-08-01 --days 400 > app/lode/puzzles.js
//
// Regenerating is safe and idempotent: the day chosen for a given date is a
// pure function of the date seed, so re-running never reshuffles history.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

// ─── tunables ──────────────────────────────────────────────────────────────
// The junk floor is scaled BY LENGTH, which is the single biggest quality lever
// on the whole game. Measured on the shipped dictionary: almost every piece of
// garbage a flat floor lets through is four letters long (berk, naik, kana,
// arak, ecco, coll, comm, tung), because short strings pick up frequency from
// proper nouns, brands and foreign words. Genuine rare words are long
// (commode 2.30, granary 2.57, fandango 2.68, domicile 2.75). So four-letter
// words must clear a higher bar than long ones — which also makes them
// uniformly tier 1, the board's chip shots — while length earns a word the
// benefit of the doubt. The four-letter floor was 4.0 at launch, but that was
// too aggressive: it rejected hundreds of everyday words that sit just under it
// (unto 3.96, oath 3.96, atom 3.72, barn, deaf, neat, halt, verb, idle...),
// which players reasonably typed and got bounced. Lowered to 3.4 (2026-07-26):
// real junk lives below ~3.3 at four letters, so 3.4 keeps the board clean
// while accepting common vocabulary.
const FLOORS = { 4: 3.4, 5: 2.6, 6: 2.25 };
const FLOOR_LONG = 2.1;      // seven letters and up
const floorFor = (n) => FLOORS[n] ?? FLOOR_LONG;
const TIER_RARE = 2.9;       // < this (and above the floor) is RARE (x3)
const TIER_UNCOMMON = 3.9;   // < this (and >= RARE)  is UNCOMMON  (x2)
const MIN_LEN = 4;
const LETTERS = 7;           // weekdays
const LETTERS_SUNDAY = 8;    // Sunday Edition deals an extra letter
const MIN_WORDS = 20;
const MAX_WORDS = 46;
const MIN_WORDS_SUNDAY = 30;
const MAX_WORDS_SUNDAY = 70;
const MIN_PANGRAMS = 1;
const MAX_PANGRAMS = 4;
// The solve line, as a share of the board maximum. Deliberately reachable in a
// few minutes: Lode shares a reader's morning with two dozen other dailies, so
// the day has to close cleanly. Everything past it is for the obsessives.
const VEIN_SHARE = 0.38;

// The rank ladder, as a share of the board maximum. Reaching `Lode` solves the
// day; `Mother Lode` means every word on the board.
const RANKS = [
  { name: 'Speck', at: 0.03 },
  { name: 'Trace', at: 0.09 },
  { name: 'Seam', at: 0.18 },
  { name: 'Vein', at: 0.27 },
  { name: 'Lode', at: VEIN_SHARE },
  { name: 'Mother Lode', at: 1 },
];

// Inflections are real words and are accepted, but they are not DISCOVERIES:
// "ganging" is only rare because nobody writes it, not because it is a prize.
// Capping them below the top tier keeps the rare bonus pointed at genuine
// vocabulary (ennui, granary, fandango) instead of padded verb forms.
const INFLECTED = /(ING|ED|ER|IER|IEST|LY)$/;

// ─── word data ─────────────────────────────────────────────────────────────
const freq = JSON.parse(readFileSync(join(here, '.lode-freq.json'), 'utf8'));

function tierOf(z, upper) {
  const t = z < TIER_RARE ? 3 : z < TIER_UNCOMMON ? 2 : 1;
  return INFLECTED.test(upper) ? Math.min(t, 2) : t;
}
function pointsOf(word, isPangram, tier) {
  return (word.length - 2) * tier + (isPangram ? 10 : 0);
}

const WORDS = [];
for (const [w, z] of Object.entries(freq)) {
  if (w.length < MIN_LEN || z < floorFor(w.length)) continue;
  const up = w.toUpperCase();
  WORDS.push({ w: up, set: new Set(up), tier: tierOf(z, up) });
}
// Bucket by letter-set signature so board assembly is a lookup, not a scan.
const bySig = new Map();
for (const it of WORDS) {
  const sig = [...it.set].sort().join('');
  if (!bySig.has(sig)) bySig.set(sig, []);
  bySig.get(sig).push(it);
}

// Candidate letter sets = the distinct-letter signatures of real words, which
// guarantees at least one pangram exists. 'S' is excluded so a board is not
// padded out with trivial plurals (the same reason Spelling Bee drops it).
function rootSets(size) {
  const out = [];
  for (const sig of bySig.keys()) {
    if (sig.length !== size || sig.includes('S')) continue;
    out.push(sig);
  }
  return out;
}

function buildBoard(sig, core) {
  const allowed = new Set(sig);
  const words = [];
  let pangrams = 0;
  for (const [s, items] of bySig) {
    if (!s.includes(core)) continue;
    let ok = true;
    for (const ch of s) if (!allowed.has(ch)) { ok = false; break; }
    if (!ok) continue;
    const isPan = s.length === sig.length;
    for (const it of items) {
      if (isPan) pangrams++;
      words.push({ w: it.w, p: pointsOf(it.w, isPan, it.tier), t: it.tier, g: isPan ? 1 : 0 });
    }
  }
  if (!words.length) return null;
  words.sort((a, b) => (b.p - a.p) || a.w.localeCompare(b.w));
  const max = words.reduce((s, x) => s + x.p, 0);
  return { sig, core, words, pangrams, max };
}

function boardOk(b, sunday) {
  if (!b) return false;
  const lo = sunday ? MIN_WORDS_SUNDAY : MIN_WORDS;
  const hi = sunday ? MAX_WORDS_SUNDAY : MAX_WORDS;
  if (b.words.length < lo || b.words.length > hi) return false;
  if (b.pangrams < MIN_PANGRAMS || b.pangrams > MAX_PANGRAMS) return false;
  // A board with no rare words is a grind; one that is all rare is unplayable.
  const rare = b.words.filter((x) => x.t === 3).length / b.words.length;
  if (rare < 0.15 || rare > 0.72) return false;
  return true;
}

// ─── deterministic shuffle (mulberry32) ────────────────────────────────────
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const START = arg('from', '2026-08-01');
const DAYS = Number(arg('days', 400));
const SEED = Number(arg('seed', 20260801));

const weekday = rootSets(LETTERS);
const sunday = rootSets(LETTERS_SUNDAY);

// Pre-build every acceptable (set, core) board once, then deal them out in a
// seeded order. Building up front means the day-to-day dealing is trivial and
// a re-run with the same seed reproduces the identical bank.
function poolFor(sigs, isSunday) {
  const pool = [];
  for (const sig of sigs) {
    for (const core of sig) {
      const b = buildBoard(sig, core);
      if (boardOk(b, isSunday)) pool.push(b);
    }
  }
  return pool;
}
const poolWeek = poolFor(weekday, false);
const poolSun = poolFor(sunday, true);

function shuffled(arr, seed) {
  const r = rng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const dealWeek = shuffled(poolWeek, SEED);
const dealSun = shuffled(poolSun, SEED + 1);

if (!dealWeek.length || !dealSun.length) {
  console.error(`No boards survived the filters (weekday ${poolWeek.length}, sunday ${poolSun.length}). Loosen the tunables.`);
  process.exit(1);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function ranksFor(max) {
  // Thresholds are absolute points, rounded, and strictly increasing so two
  // ranks can never share a cutoff on a small board.
  const out = [];
  let last = 0;
  for (const r of RANKS) {
    const at = r.at === 1 ? max : Math.max(last + 1, Math.round(max * r.at));
    out.push({ n: r.name, at });
    last = at;
  }
  return out;
}

const lines = [];
let iw = 0, is = 0;
const start = new Date(START + 'T12:00:00Z');
for (let i = 0; i < DAYS; i++) {
  const d = new Date(start.getTime() + i * 86400000);
  const y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, da = d.getUTCDate();
  const isSun = d.getUTCDay() === 0;
  const b = isSun ? dealSun[is++ % dealSun.length] : dealWeek[iw++ % dealWeek.length];
  const rk = ranksFor(b.max);
  const vein = rk.find((x) => x.n === 'Lode').at;
  const others = [...b.sig].filter((c) => c !== b.core).sort();
  lines.push(JSON.stringify({
    num: i + 1,
    quizId: `lode-${mo}-${da}-${String(y).slice(2)}`,
    live: `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`,
    dateLabel: `${MONTHS[mo - 1]} ${da}, ${y}`,
    sunday: isSun,
    core: b.core,
    outer: others,
    vein,
    max: b.max,
    pangrams: b.pangrams,
    ranks: rk,
    words: b.words,
  }));
}

process.stdout.write(`// Puzzle data for Lode, the daily letter-mining word game. Imported ONLY by
// the server page (app/lode/page.js), which filters live<=today before passing
// puzzles to the client — so future boards (and their word lists) never reach
// the browser bundle.
//
// GENERATED by scripts/gen-lode.mjs — do not hand-edit. Every field is derived:
// \`words\` is the complete scored answer list (p = points, t = rarity tier 1/2/3,
// g = 1 for a pangram), \`max\` is their sum, \`vein\` is the solve line, and
// \`ranks\` is the ladder in absolute points. Validate with scripts/verify-lode.mjs.
export const PUZZLES = [
${lines.map((l) => '  ' + l + ',').join('\n')}
];
`);

console.error(`lode: ${DAYS} days from ${START} · weekday pool ${poolWeek.length} · sunday pool ${poolSun.length}`);
