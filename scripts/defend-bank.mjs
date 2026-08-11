// Turn a pool of Defend candidates (scripts/gen-defend.mjs) into a dated bank
// and print app/defend/puzzles.js.
//
//   node scripts/defend-bank.mjs <firstLiveDate> <days> <candidate.json...>
//   node scripts/defend-bank.mjs 2026-08-11 56 /tmp/wk.json /tmp/su.json
//
// TWO THINGS THIS DOES THAT MATTER, beyond stapling dates on:
//
// 1. THE WEEK RAMPS. Candidates are sorted by how hard they are to see and
//    dealt so Monday takes the easiest tier of the pool and Saturday the
//    hardest, the same shape Paths and Cipher use. Difficulty here is mostly
//    `parries`, the number of moves that answer the immediate threat: a board
//    with six plausible defences and one real one is a much longer look than a
//    board with three. The reply count is a mild second term.
//
// 2. A MOTIF STRING IS NOT ALLOWED TO REPEAT MORE THAN TWICE. The motif is
//    reader-facing flavour and the pool is machine-written, so without a
//    ceiling a bank happily ships the same sentence a dozen times. The bank
//    verifier enforces the same ceiling; this is what stops it from ever
//    firing.
//
// Sundays are drawn from the hold-for-three pool and weekdays from hold-for-two,
// matched to the real weekday of each date, so the `sunday` flag can never
// disagree with the calendar.
import { readFileSync } from 'node:fs';

const [firstLive, daysArg, ...files] = process.argv.slice(2);
const DAYS = Number(daysArg || 56);
const MOTIF_CEILING = 2;

const pool = [];
const seen = new Set();
for (const f of files) {
  for (const c of JSON.parse(readFileSync(f, 'utf8'))) {
    const pos = c.fen.split(' ')[0];
    if (seen.has(pos)) continue;
    seen.add(pos);
    pool.push(c);
  }
}

// How long the board takes to see. Decoys dominate: every extra move that
// answers the threat is another line the solver has to reject.
const hardness = (c) => c.parries * 10 + c.moves * 0.4 + (c.followUp <= 1 ? 3 : 0);

// Thin the pool to the motif ceiling BEFORE anything is dealt, so a repeated
// sentence can never reach a date in the first place.
function capMotifs(list) {
  const used = new Map();
  return list.filter((c) => {
    const n = used.get(c.motif) || 0;
    if (n >= MOTIF_CEILING) return false;
    used.set(c.motif, n + 1);
    return true;
  });
}

const isoAdd = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const dowOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const labelOf = (iso) => new Date(`${iso}T12:00:00Z`)
  .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const quizIdOf = (iso) => {
  const [y, m, d] = iso.split('-');
  return `defend-${Number(m)}-${Number(d)}-${y.slice(2)}`;
};

const dates = Array.from({ length: DAYS }, (_, i) => isoAdd(firstLive, i));
const sundays = dates.filter((d) => dowOf(d) === 0);
const weekdays = dates.filter((d) => dowOf(d) !== 0);

// The cap runs across the WHOLE pool before it is split, not per weekday and
// Sunday pool. Capping each side separately let a sentence appear twice in the
// weekdays and once more on a Sunday, which is three times in one bank and is
// exactly what the ceiling exists to stop.
const capped = capMotifs(pool);
const wkPool = capped.filter((c) => c.holdFor === 2).sort((a, b) => hardness(a) - hardness(b));
const suPool = capped.filter((c) => c.holdFor === 3).sort((a, b) => hardness(a) - hardness(b));
if (wkPool.length < weekdays.length) throw new Error(`need ${weekdays.length} weekday boards, pool has ${wkPool.length}`);
if (suPool.length < sundays.length) throw new Error(`need ${sundays.length} Sunday boards, pool has ${suPool.length}`);

// Deal the weekday pool into six tiers, easiest tier to Monday. Each tier is
// sized to the number of that weekday in the range, so a range that starts
// mid-week still ramps correctly.
const byDow = {};
for (const d of weekdays) (byDow[dowOf(d)] = byDow[dowOf(d)] || []).push(d);
const order = [1, 2, 3, 4, 5, 6];
const chosen = new Map();
// Spread the selection across the whole pool so the bank uses its full range
// rather than clustering at the easy end.
const step = wkPool.length / weekdays.length;
const spread = Array.from({ length: weekdays.length }, (_, i) => wkPool[Math.floor(i * step)]);
let at = 0;
for (const dow of order) {
  for (const date of byDow[dow] || []) {
    chosen.set(date, spread[at++]);
  }
}
const suSpread = Array.from({ length: sundays.length }, (_, i) => suPool[Math.floor(i * (suPool.length / sundays.length))]);
sundays.forEach((date, i) => chosen.set(date, suSpread[i]));

const rows = dates.map((live, i) => {
  const c = chosen.get(live);
  const sunday = dowOf(live) === 0;
  return { num: i + 1, quizId: quizIdOf(live), live, dateLabel: labelOf(live), sunday, holdFor: c.holdFor,
    fen: c.fen, key: c.key, keySan: c.keySan, reply: c.reply, parries: c.parries, motif: c.motif };
});

const body = rows.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    holdFor: ${p.holdFor},
    fen: '${p.fen}',
    key: '${p.key}',
    keySan: '${p.keySan}',
    reply: '${p.reply}',
    parries: ${p.parries},
    motif: '${p.motif.replace(/'/g, "\\'")}',
  },`).join('\n');

const HEADER = `// Puzzle data for Defend, the daily chess save. Imported ONLY by the server
// page (app/defend/page.js), which filters live<=today before handing the bank
// to the client, so tomorrow's position and the move that holds it never ship
// to a browser.
//
// Each puzzle is a position with BLACK TO MOVE, black NOT in check, and White
// already threatening mate. EVERY legal black move loses to a forced checkmate
// within \`holdFor\` white moves EXCEPT ONE. Weekdays hold for two, Sundays step
// up to a hold for three.
//
//   fen       full FEN, black to move. Castling is always '-', en passant
//             always '-', and no pawn ever stands on rank 1, 2, 7 or 8, which
//             is what lets the engine (app/mate/chess.js, shared with Mate)
//             skip castling, en passant and promotion entirely.
//   key       the ONE black move that survives, in UCI. Every other legal move
//             on the board is mate in \`holdFor\` or fewer.
//   keySan    the same move in algebraic, for the reveal.
//   reply     White's stubbornest answer to the key, precomputed by
//             stubbornestReply() in app/defend/defense.js. It is stored rather
//             than searched in the browser because that one search is the
//             expensive one, and storing it also guarantees every player faces
//             the same defence. Later replies are cheap and are computed live.
//   parries   how many black moves answer the immediate threat, i.e. how many
//             look like a defence. Always at least three, so the key always has
//             at least two convincing decoys beside it.
//   motif     the defensive idea, revealed only to a player who survived.
//
// Every board was checked twice: by the generator's search and, independently,
// by scripts/verify-defend.mjs, which re-derives the unique saving move from
// the FEN with its own solver and its own board representation rather than
// trusting anything stored here.
export const PUZZLES = [
`;

console.log(HEADER + body + '\n];\n');
