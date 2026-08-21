#!/usr/bin/env node
// gen-queen — deal the Queen bank (the daily king-and-pawn promotion endgame).
//
//   node scripts/gen-queen.mjs [--days N] [--from YYYY-MM-DD] > /tmp/queen-puzzles.js
//
// Selection rules (the authoring rules live in app/queen/puzzles.js's header;
// this generator enforces the machine-checkable ones and verify-queen.mjs
// re-proves them with its own independent solver):
//   - every board is White to move with a tablebase-proven win in EXACTLY the
//     day's winIn White moves (the weekday ramp below, deeper on Sundays);
//   - EXACTLY ONE first move preserves the win inside that budget, at least
//     four legal first moves exist, and at least TWO of the alternatives throw
//     the win away outright (a draw, not merely a slower win);
//   - pool variety: a pawn file appears at most 8 times across the bank and
//     never two days running; no duplicate positions; roughly a third of the
//     keys are pawn moves and the rest king moves (opposition is the lesson).
import { tablebase, DRAW, whiteMoves, moveValue, legalState, toFen, sanOf, squareName, fileOf } from '../app/queen/kpk.js';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = Number(argOf('--days', 45));
const FROM = argOf('--from', '2026-08-21');

// Weekday ramp: getUTCDay() on the noon-UTC instant of the live date.
const RAMP = { 1: 5, 2: 6, 3: 7, 4: 8, 5: 8, 6: 9, 0: 12 };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260821);

// ─── candidate pools, by dtp then key piece ────────────────────────────────
const pool = new Map(); // `${dtp}|${keyPiece}` -> [{ s, key, fen }]
for (let file = 0; file < 8; file++) {
  const tb = tablebase(file);
  for (let wk = 0; wk < 64; wk++) for (let bk = 0; bk < 64; bk++) for (let pr = 1; pr <= 6; pr++) {
    const s = { wk, bk, p: pr * 8 + file, stm: 'w' };
    if (!legalState(s)) continue;
    const n = tb.w(s);
    if (n === DRAW || n < 5 || n > 13) continue;
    const mvs = whiteMoves(s);
    if (mvs.length < 4) continue;
    const opt = mvs.filter((m) => moveValue(s, m) === n);
    if (opt.length !== 1) continue;
    const draws = mvs.filter((m) => moveValue(s, m) === DRAW).length;
    if (draws < 2) continue;
    const key = opt[0];
    const k = `${n}|${key.piece}`;
    if (!pool.has(k)) pool.set(k, []);
    pool.get(k).push({ s, key, n, file });
  }
}

const seen = new Set();
const fileCount = new Array(8).fill(0);
let lastFile = -1;
const days = [];
const d0 = new Date(`${FROM}T12:00:00Z`);
for (let i = 0; i < DAYS; i++) {
  const d = new Date(d0.getTime() + i * 86400000);
  const iso = d.toISOString().slice(0, 10);
  const dow = d.getUTCDay();
  const wantPiece = i % 3 === 1 ? 'P' : 'K';
  const dtp = RAMP[dow];
  // preferred key piece first, the other as the fallback when every preferred
  // candidate fails a variety gate
  let picked = null;
  for (const piece of [wantPiece, wantPiece === 'P' ? 'K' : 'P']) {
    const cands = (pool.get(`${dtp}|${piece}`) || []).concat();
    for (let j = cands.length - 1; j > 0; j--) { const k = Math.floor(rnd() * (j + 1)); [cands[j], cands[k]] = [cands[k], cands[j]]; }
    for (const c of cands) {
      const fen = toFen(c.s);
      if (seen.has(fen)) continue;
      if (c.file === lastFile) continue;
      if (fileCount[c.file] >= 8) continue;
      picked = { ...c, fen };
      break;
    }
    if (picked) break;
  }
  if (!picked) throw new Error(`no candidate for ${iso} (dtp ${dtp}, piece ${wantPiece})`);
  seen.add(picked.fen);
  fileCount[picked.file]++;
  lastFile = picked.file;
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  days.push({
    num: i + 1,
    quizId: `queen-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
    live: iso,
    dateLabel: `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    sunday: dow === 0,
    winIn: dtp,
    fen: picked.fen,
    keyUci: picked.key.uci,
    keySan: sanOf(picked.s, picked.key),
  });
}

const HEADER = `// Puzzle data for Queen, the daily king-and-pawn promotion endgame. Imported
// ONLY by the server page (app/queen/page.js), which filters live<=today and
// STRIPS keyUci/keySan before handing boards to the client, so neither
// tomorrow's position nor any day's key move ever ships to the browser.
//
// Each puzzle is a position with WHITE TO MOVE: a king and one pawn against a
// bare king, with a tablebase-proven promotion in exactly \`winIn\` White moves.
//
//   fen      full FEN. Only K, P and k ever appear; castling and en passant are
//            structurally impossible and the engine (app/queen/kpk.js) plays
//            the position perfectly from a per-file tablebase built in the
//            browser.
//   winIn    White's whole budget, in White moves. EXACTLY ONE first move
//            preserves the win inside it; at least two of the alternatives
//            throw the win away outright (a draw, not a slower win). Winning
//            means promoting SAFELY: a queen the Black king can take back, or a
//            push that delivers stalemate, is the draw it deserves to be.
//   keyUci / keySan  the key move, for the verifier and the reveal-to-solvers
//            line. Stripped server-side, never sent to the browser.
//
// Weekday ramp (win in N White moves): Mon 5, Tue 6, Wed 7, Thu 8, Fri 8,
// Sat 9, and the Sunday Edition at 12, the long walk. Bank rules, all enforced
// by scripts/verify-queen.mjs with its own independent solver: exact winIn,
// unique key, at least two outright refutations, at least four legal first
// moves, no duplicate positions, a pawn file at most 8 times per bank and never
// twice running, and roughly a third of the keys pawn moves.
export const PUZZLES = [
`;
const rows = days.map((p) => `  { num: ${p.num}, quizId: '${p.quizId}', live: '${p.live}', dateLabel: '${p.dateLabel}', sunday: ${p.sunday}, winIn: ${p.winIn}, fen: '${p.fen}', keyUci: '${p.keyUci}', keySan: '${p.keySan}' },`);
process.stdout.write(HEADER + rows.join('\n') + '\n];\n');
console.error(`dealt ${days.length} boards, files used: ${fileCount.join(',')}`);
