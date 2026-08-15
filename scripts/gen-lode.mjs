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
// The same frequency data doubles as the junk filter: the shipped dictionaries
// (public/tuck-dict.txt for 4 to 8 letters, public/tuck-dict-long.txt for 9 to
// 15) are Scrabble word lists full of words no human knows, so anything below
// the Zipf floor, or outside hunspell's en_US/en_GB, is dropped from the board
// entirely. Every word on a Lode board is a word a reader could plausibly
// recognise.
//
// Lode read the 4-to-8 list ALONE until 2026-08-15, so no word of nine letters
// or more could appear on any board. Players typed BEGINNING, COHERENCE,
// INITIALLY and ABBREVIATE and were told they were not words. Both lists are
// read now, which is where most of the pool's growth came from.
//
// Each day carries a VEIN: the target score that counts the day as solved, set
// at a fixed share of the board's maximum. Ranks below it give the ladder
// something to climb, and MOTHER LODE (every word) is there for the obsessives.
//
// Usage:
//   python3 scripts/lode-words.py > scripts/.lode-freq.json   (once, or to refresh)
//   node scripts/gen-lode.mjs --from 2026-08-01 --days 400 > app/lode/puzzles.js
//
// Changing the word pool reshuffles the WHOLE bank, including boards already
// played, so a refresh regenerates future dates only and splices them under the
// boards that have gone live (--from tomorrow, --startnum after the last one).
//
// Regenerating is safe and idempotent: the day chosen for a given date is a
// pure function of the date seed, so re-running never reshuffles history.

import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join, resolve } from 'path';

const here = dirname(fileURLToPath(import.meta.url));

// ─── tunables ──────────────────────────────────────────────────────────────
// The junk floor is scaled BY LENGTH, and for most of Lode's life it was the
// ONLY thing standing between a reader and the Scrabble tail. That was the
// wrong tool. The shipped dictionary is full of proper nouns (james, texas,
// paris, facebook), and a name is FREQUENT, so the only floor high enough to
// stop names also stopped ordinary vocabulary that simply is not written down
// much. Four letters was where it hurt: at a 3.4 floor the board rejected lard
// (2.98), howl (3.18), silt (2.96), coax (2.96), hilt (2.90), faze (2.91),
// cowl (2.87), ruse (3.16) and yelp (3.25), all words a player will type and
// expect to count. Frequency cannot tell "nobody knows it" from "nobody writes
// it"; only a dictionary can.
//
// So as of 2026-07-30 the vocabulary gate moved into scripts/lode-words.py,
// which checks every word against hunspell's CASE SENSITIVE en_US dictionary
// and drops anything that exists only as a capitalized name. With names gone,
// the floor no longer has to do their policing and drops to where the gated
// list genuinely stops being placeable vocabulary: about 2.7 at four letters,
// 2.25 at five, 2.1 at six and just above 2 beyond that. Below those the gated
// list turns into words that are real but nobody could place (fulvous, bascule,
// catechin, ecotone), which is the category Lode exists to keep off the board.
//
// These MUST stay in sync with NEW / NEW_LONG in scripts/lode-words.py, which
// applies the same floors when it freezes the data — the JSON is authoritative
// and these are the second gate.
const FLOORS = { 4: 2.7, 5: 2.25, 6: 2.1 };
const FLOOR_LONG = 2.05;     // seven letters and up
const floorFor = (n) => FLOORS[n] ?? FLOOR_LONG;
// Four-letter words used to be uniformly tier 1 because nothing under 3.4 could
// reach a board. Now the 2.7-2.9 band opens up, so a genuinely uncommon short
// word (faze, cask, curd, cowl) can score as rare. That is the game's promise
// working as intended: knowing the word is the achievement, not its length.
const TIER_RARE = 2.9;       // < this (and above the floor) is RARE (x3)
const TIER_UNCOMMON = 3.9;   // < this (and >= RARE)  is UNCOMMON  (x2)
const MIN_LEN = 4;
const LETTERS = 7;           // weekdays
const LETTERS_SUNDAY = 8;    // Sunday Edition deals an extra letter
// How many words a board may hold. Raised from 46/70 on 2026-08-15 (owner call)
// in the same pass that lifted the pool's eight-letter cap: with nine- to
// fifteen-letter words finally in the data the pool went 28,779 -> 49,189, and
// holding the old ceiling would have spent that entirely on REJECTING the
// fuller boards rather than on giving players more to find. At 60/95 the
// average weekday board carries about 39 words and the Sunday about 64.
const MIN_WORDS = 20;
const MAX_WORDS = 60;
const MIN_WORDS_SUNDAY = 30;
const MAX_WORDS_SUNDAY = 95;
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
// Boards already played must not be renumbered or reshuffled, so a regeneration
// that changes the word pool covers only future dates and picks up the
// numbering where the surviving bank left off:
//   node scripts/gen-lode.mjs --from 2026-07-31 --startnum 7 --days 494
const START_NUM = Number(arg('startnum', 1));
// A regeneration keeps the boards that have already gone live and deals fresh
// ones underneath them, so the new deal has to know what those kept boards
// used or it can hand out a letter set a player saw a few weeks ago. Point
// --avoid at the bank being spliced into and those boards leave the pool:
//   node scripts/gen-lode.mjs --from 2026-08-16 --startnum 23 --days 478 \
//     --avoid app/lode/puzzles.js
// Filtering happens before the shuffle, so a re-run still reproduces exactly.
const AVOID = arg('avoid', '');
const avoidKeys = new Set();
if (AVOID) {
  const mod = await import(pathToFileURL(resolve(AVOID)).href);
  // Only the boards the splice KEEPS matter: anything dated on or after --from
  // is being replaced by this run, so excluding it would shrink the pool for
  // no reason.
  for (const p of mod.PUZZLES || []) {
    if (p.live >= START) continue;
    avoidKeys.add([p.core, ...p.outer].sort().join('') + '/' + p.core);
  }
}
const boardKey = (b) => [...b.sig].sort().join('') + '/' + b.core;

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
      if (boardOk(b, isSunday) && !avoidKeys.has(boardKey(b))) pool.push(b);
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
    num: START_NUM + i,
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

console.error(`lode: ${DAYS} days from ${START} · weekday pool ${poolWeek.length} · sunday pool ${poolSun.length}` + (AVOID ? ` · avoiding ${avoidKeys.size} kept boards` : ''));
