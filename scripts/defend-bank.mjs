// Turn a pool of Defend candidates (scripts/gen-defend.mjs) into a dated bank
// and print app/defend/puzzles.js.
//
//   node scripts/defend-bank.mjs <firstLive> <days> <freezeDate> <candidate.json...>
//   node scripts/defend-bank.mjs 2026-08-11 56 2026-08-11 /tmp/h3.json /tmp/h4.json
//
// THE FREEZE DATE IS NOT OPTIONAL. Every board live on or before it is copied
// VERBATIM out of the current app/defend/puzzles.js, because those days have
// been played and their scores are on the leaderboard. Rewriting one would
// invalidate real results, which is rule 10 of the daily puzzle authoring
// standard. Only dates after the freeze are dealt from the pool.
//
// THE WEEK DOES NOT RAMP (owner ruling, 2026-08-11). An earlier version tiered
// the pool so Monday took the easiest boards and Saturday the hardest. That is
// gone: every weekday board now sits at the same floor, so the difficulty is a
// property of the game rather than of the day you happen to play it. Boards are
// dealt by a SEEDED shuffle, which is what stops any accidental correlation
// between weekday and difficulty creeping back in.
//
// A MOTIF STRING IS NOT ALLOWED TO REPEAT MORE THAN TWICE. The motif is
// reader-facing flavour and the pool is machine-written, so without a ceiling a
// bank happily ships the same sentence a dozen times. The bank verifier enforces
// the same ceiling; this is what stops it from ever firing.
//
// Sundays are drawn from the deeper pool and weekdays from the shallower one,
// matched to the real weekday of each date, so the `sunday` flag can never
// disagree with the calendar.
import { readFileSync } from 'node:fs';
import { PUZZLES as EXISTING } from '../app/defend/puzzles.js';
import { parseFen, applyMove, legalMoves, parseUci } from '../app/mate/chess.js';
import { makeMateSearch, stubbornestReply } from '../app/defend/defense.js';

const [firstLive, daysArg, freeze, ...files] = process.argv.slice(2);
const DAYS = Number(daysArg || 56);
const MOTIF_CEILING = 2;
const WEEKDAY_HOLD = 3;
const SUNDAY_HOLD = 4;

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
// Frozen boards keep their positions out of the pool, so a live day can never be
// dealt again to a future date.
const frozenPositions = new Set(EXISTING.filter((p) => p.live <= freeze).map((p) => p.fen.split(' ')[0]));

function capMotifs(list) {
  const used = new Map();
  return list.filter((c) => {
    const n = used.get(c.motif) || 0;
    if (n >= MOTIF_CEILING) return false;
    used.set(c.motif, n + 1);
    return true;
  });
}
// Deterministic shuffle, so re-running the builder on the same pool produces the
// same bank and a diff means something really changed.
function shuffled(list, seed) {
  const a = list.slice();
  let s = seed >>> 0;
  const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
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
const open = dates.filter((d) => d > freeze);
const sundays = open.filter((d) => dowOf(d) === 0);
const weekdays = open.filter((d) => dowOf(d) !== 0);

const usable = capMotifs(pool.filter((c) => !frozenPositions.has(c.fen.split(' ')[0])));
const wkPool = shuffled(usable.filter((c) => c.holdFor === WEEKDAY_HOLD), 0x5eed01);
const suPool = shuffled(usable.filter((c) => c.holdFor === SUNDAY_HOLD), 0x5eed02);
if (wkPool.length < weekdays.length) throw new Error(`need ${weekdays.length} weekday boards, pool has ${wkPool.length}`);
if (suPool.length < sundays.length) throw new Error(`need ${sundays.length} Sunday boards, pool has ${suPool.length}`);

const chosen = new Map();
weekdays.forEach((d, i) => chosen.set(d, wkPool[i]));
sundays.forEach((d, i) => chosen.set(d, suPool[i]));

// WHITE'S SECOND REPLY IS PRECOMPUTED TOO, and on a hold-for-four board that is
// not an optimisation, it is the difference between a playable page and a frozen
// one: searching it in the browser measured 1.0 to 2.7 seconds on a desktop, so
// several times that on a phone. It is well defined because the route to it is
// forced: the key is the only save, White's answer to it is stored, and the
// follow-up is an only-move by construction (MAX_FOLLOWUP is 1). Any player
// still alive at that point is in exactly this position.
function secondReply(row) {
  if (row.holdFor < 3) return null;
  let b = parseFen(row.fen).board;
  const k = parseUci(row.key); b = applyMove(b, k.from, k.to);
  const r = parseUci(row.reply); b = applyMove(b, r.from, r.to);
  const s = makeMateSearch();
  const follow = legalMoves(b, 'b').find((m) => !s.forcesMateWithin(applyMove(b, m.from, m.to), 'w', row.holdFor - 1));
  if (!follow) throw new Error(`${row.quizId}: no follow-up after the stored reply`);
  b = applyMove(b, follow.from, follow.to);
  const best = stubbornestReply(b, row.holdFor - 1, makeMateSearch());
  return best ? best.uci : null;
}

const byLive = new Map(EXISTING.map((p) => [p.live, p]));
const rows = dates.map((live, i) => {
  if (live <= freeze) {
    const kept = byLive.get(live);
    if (!kept) throw new Error(`no existing board to freeze for ${live}`);
    return { ...kept, num: i + 1 };
  }
  const c = chosen.get(live);
  return {
    num: i + 1,
    quizId: quizIdOf(live),
    live,
    dateLabel: labelOf(live),
    sunday: dowOf(live) === 0,
    holdFor: c.holdFor,
    fen: c.fen,
    key: c.key,
    keySan: c.keySan,
    reply: c.reply,
    parries: c.parries,
    motif: c.motif,
  };
});
for (const row of rows) {
  if (row.live <= freeze) continue;
  row.reply2 = secondReply(row);
}

const HEADER = `// Puzzle data for Defend, the daily chess save. Imported ONLY by the server
// page (app/defend/page.js), which filters live<=today before handing the bank
// to the client, so tomorrow's position and the move that holds it never ship
// to a browser.
//
// Each puzzle is a position with BLACK TO MOVE, black NOT in check, and White
// already threatening mate. EVERY legal black move loses to a forced checkmate
// within \`holdFor\` white moves EXCEPT ONE, and after White's stubbornest answer
// exactly one move survives AGAIN. Weekdays hold for three, Sundays for four.
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
//             than searched in the browser because that search is expensive, and
//             storing it also guarantees every player faces the same defence.
//   reply2    White's answer to the FOLLOW-UP, precomputed for the same reason.
//             The route to it is forced (the key is the only save, reply is
//             stored, and the follow-up is an only-move), so the position is
//             determined. On a hold-for-four board searching this live measured
//             one to three seconds on a desktop. Anything deeper than this runs
//             against a small budget and is cheap enough to search in the page.
//   parries   how many black moves answer the immediate threat, i.e. how many
//             look like a defence. Always at least five, so the key always has
//             at least four convincing decoys beside it. The launch bank ran a
//             floor of three and players simply tried each parry in turn.
//   motif     the defensive idea, revealed only to a player who survived.
//
// Boards 1 through ${EXISTING.filter((p) => p.live <= freeze).length} are FROZEN: they were live under the launch rules
// (hold for two, three parries) and their scores are on the leaderboard, so they
// are kept exactly as they shipped rather than regenerated.
//
// Every board was checked three times: by the generator's fast sift, by the
// shipped engine re-deriving the whole claim before it was written, and by
// scripts/verify-defend.mjs, which re-derives it again from the FEN with its own
// board representation and its own solver.
export const PUZZLES = [
`;

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
    reply: '${p.reply}',${p.reply2 ? `\n    reply2: '${p.reply2}',` : ''}
    parries: ${p.parries},
    motif: '${p.motif.replace(/'/g, "\\'")}',
  },`).join('\n');

console.log(HEADER + body + '\n];\n');
