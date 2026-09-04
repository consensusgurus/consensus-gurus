// Bank generator for FINESSE, the daily double dummy.
//
//   node scripts/gen-finesse.mjs [--from 2026-09-03] [--to 2026-11-19] > app/finesse/puzzles.js
//
// A day is kept only when all of this holds, which is why banking is a search
// and not a shuffle:
//   * with South on lead, best play against a perfect defence takes exactly
//     `target` tricks, so the contract is makeable and not over-makeable;
//   * at trick one South has at least MIN_OPTIONS distinct cards to choose from
//     and EXACTLY ONE of them still makes it;
//   * the deal has at least two decision points where only one card holds, so
//     it is a line to find rather than a single guess;
//   * on the two finesse days the winning card is led INTO a tenace: the hand
//     to South's left holds an honour the dummy sits over on both sides.
//
// The week ramps by DECK SIZE, not by rule count: Monday is 4 ranks and no
// trumps, the Sunday Edition is the full 8. A bigger deck is a deeper tree and
// a later separation point, which is the honest way to make a search harder.
import {
  makeDeck, bits, suitOf, rankOf, cardName, makeSolver, analyse, parseHand, RANK_NAMES,
} from '../lib/finesse-core.js';

const SUIT_LETTER = ['S', 'H', 'D', 'C'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// weekday -> [ranks, trumps?, [minTarget, maxTarget], theme]
// 0 Sun … 6 Sat.
const RAMP = {
  1: { R: 4, trumps: false, band: [3, 3], theme: null,      note: 'entries' },
  2: { R: 5, trumps: false, band: [3, 4], theme: null,      note: 'order' },
  3: { R: 5, trumps: true,  band: [3, 4], theme: null,      note: 'the first ruff' },
  4: { R: 6, trumps: true,  band: [4, 5], theme: 'finesse', note: 'a finesse' },
  5: { R: 6, trumps: true,  band: [4, 5], theme: 'finesse', note: 'a finesse' },
  6: { R: 7, trumps: true,  band: [5, 6], theme: null,      note: 'a hand' },
  0: { R: 8, trumps: true,  band: [5, 6], theme: null,      note: 'the full deck' },
};

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FROM = arg('--from', '2026-09-03');
const TO = arg('--to', '2026-11-19');
const NUM0 = Number(arg('--num0', '0'));
const JSONL = process.argv.includes('--jsonl');

function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

function deal(R, rand) {
  const d = makeDeck(R);
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  const m = [0, 0, 0, 0];
  for (let i = 0; i < d.length; i++) m[i % 4] |= (1 << d[i]);
  return m;
}

// The classic position: South leads a card West can beat, and North holds one
// card above West's honour and one below it. That is a finesse and not just a
// good lead, and it is the only shape the name promises.
function isFinesse(R, m, card) {
  const X = suitOf(card, R), r = rankOf(card, R);
  const inSuit = (mask) => bits(mask).filter((c) => suitOf(c, R) === X).map((c) => rankOf(c, R));
  const W = inSuit(m[3]), N = inSuit(m[0]);
  if (!W.length || N.length < 2) return false;
  const wHi = Math.max(...W);
  return r < wHi && N.some((x) => x > wHi) && N.some((x) => x < wHi && x > r);
}

function tryDeal(R, trumpsOn, band, theme, m) {
  const trumps = trumpsOn ? [0, 1, 2, 3] : [-1];
  for (const trump of trumps) {
    const S = makeSolver(R, trump);
    const target = S.boundary(m, 2);
    if (target < band[0] || target > band[1]) continue;
    const a = analyse(R, trump, m, target);
    const d1 = a.decisions[0];
    const minOpts = R <= 4 ? 3 : 4;
    if (!d1 || d1.options < minOpts || d1.winners !== 1) continue;
    if (a.uniq < 2) continue;
    const winName = d1.cards.find((x) => x.v >= target).n;
    let win = -1;
    for (let c = 0; c < 4 * R; c++) if (cardName(c, R) === winName) { win = c; break; }
    if (theme === 'finesse' && !isFinesse(R, m, win)) continue;
    return { trump, target, a, win: winName };
  }
  return null;
}

function* days(from, to) {
  const d = new Date(from + 'T12:00:00Z'), end = new Date(to + 'T12:00:00Z');
  while (d <= end) {
    const iso = d.toISOString().slice(0, 10);
    yield { iso, dow: d.getUTCDay(), y: d.getUTCFullYear(), mo: d.getUTCMonth(), day: d.getUTCDate() };
    d.setUTCDate(d.getUTCDate() + 1);
  }
}

// Day one is the board the owner approved from the mockup, pinned rather than
// searched, so what shipped is what he played.
const PIN_1 = {
  R: 6, trump: 2, target: 5,
  hands: ['CA CQ D10 HK H9 SA', 'C10 DA HA SK SQ S9', 'C9 DK DQ D9 HJ S10', 'CK CJ DJ HQ H10 SJ'],
};

const rows = [];
let num = NUM0;
for (const d of days(FROM, TO)) {
  num++;
  const cfg = RAMP[d.dow];
  let found = null, masks = null, R = cfg.R;
  if (num === 1) {
    R = PIN_1.R;
    masks = PIN_1.hands.map((h) => parseHand(h, R));
    const S = makeSolver(R, PIN_1.trump);
    const target = S.boundary(masks, 2);
    if (target !== PIN_1.target) throw new Error('pinned day 1 no longer solves to ' + PIN_1.target + ' (got ' + target + ')');
    found = { trump: PIN_1.trump, target, a: analyse(R, PIN_1.trump, masks, target), win: '' };
  } else {
    const rand = rng(20260903 + num * 7919);
    for (let t = 0; t < 20000 && !found; t++) {
      const m = deal(R, rand);
      const hit = tryDeal(R, cfg.trumps, cfg.band, cfg.theme, m);
      if (hit) { found = hit; masks = m; }
    }
    if (!found) throw new Error('no deal found for ' + d.iso);
  }
  const seats = masks.map((m) => bits(m).sort((a, b) => suitOf(a, R) - suitOf(b, R) || rankOf(b, R) - rankOf(a, R)).map((c) => cardName(c, R)).join(' '));
  rows.push({
    num,
    quizId: `finesse-${d.mo + 1}-${d.day}-${String(d.y).slice(2)}`,
    live: d.iso,
    dateLabel: `${MONTHS[d.mo]} ${d.day}, ${d.y}`,
    sunday: d.dow === 0,
    ranks: R,
    trump: found.trump < 0 ? null : SUIT_LETTER[found.trump],
    target: found.target,
    north: seats[0], east: seats[1], south: seats[2], west: seats[3],
    sep: found.a.sep,
    uniq: found.a.uniq,
    choices: found.a.choices,
  });
  if (JSONL) process.stdout.write(JSON.stringify(rows[rows.length - 1]) + '\n');
  if (process.env.FINESSE_PROGRESS) process.stderr.write(`${d.iso} R${R} sep${found.a.sep} ok\n`);
}

if (JSONL) process.exit(0);
const q = (s) => `'${s}'`;
const out = [];
out.push(`// Puzzle data for Finesse, the daily double dummy. Imported ONLY by the server`);
out.push(`// page (app/finesse/page.js), which filters live<=today before handing deals to`);
out.push(`// the client.`);
out.push(`//`);
out.push(`// NOTHING HERE IS SECRET, and that is the point of the game: all four hands are`);
out.push(`// face up, so the deal IS the puzzle. What is not banked is the LINE — the`);
out.push(`// client re-derives it with the same solver the defence uses, so there is no`);
out.push(`// second copy of the answer to drift from the first.`);
out.push(`//`);
out.push(`//   ranks    cards in a hand, and ranks in each suit: 4 is J Q K A, 8 is 7 to A.`);
out.push(`//   trump    suit letter, or null for no trumps.`);
out.push(`//   target   tricks South must take of the \`ranks\` available. Exactly makeable:`);
out.push(`//            best play against a perfect defence takes this many and no more.`);
out.push(`//   sep      MEASURED: the trick at which the only winning play first separates`);
out.push(`//            from the alternatives. 1 is the hardest a deal can be.`);
out.push(`//   uniq     decision points with more than one card and only one that holds.`);
out.push(`//`);
out.push(`// The week ramps by deck size: Mon 4 no trumps, Tue 5, Wed 5 + trumps,`);
out.push(`// Thu/Fri 6 with a finesse, Sat 7, Sunday Edition the full 8.`);
out.push(`//`);
out.push(`// Do NOT hand-edit a deal. Regenerate with scripts/gen-finesse.mjs and re-run`);
out.push(`// scripts/verify-finesse.mjs, which re-solves every board with an independent`);
out.push(`// naive minimax.`);
out.push(`export const PUZZLES = [`);
for (const r of rows) {
  out.push(`  {`);
  out.push(`    num: ${r.num},`);
  out.push(`    quizId: ${q(r.quizId)},`);
  out.push(`    live: ${q(r.live)},`);
  out.push(`    dateLabel: ${q(r.dateLabel)},`);
  out.push(`    sunday: ${r.sunday},`);
  out.push(`    ranks: ${r.ranks},`);
  out.push(`    trump: ${r.trump ? q(r.trump) : 'null'},`);
  out.push(`    target: ${r.target},`);
  out.push(`    sep: ${r.sep},`);
  out.push(`    uniq: ${r.uniq},`);
  out.push(`    north: ${q(r.north)},`);
  out.push(`    east: ${q(r.east)},`);
  out.push(`    south: ${q(r.south)},`);
  out.push(`    west: ${q(r.west)},`);
  out.push(`  },`);
}
out.push(`];`);
out.push(``);
process.stdout.write(out.join('\n'));
process.stderr.write(`\n${rows.length} deals, ${FROM} to ${TO}\n`);
