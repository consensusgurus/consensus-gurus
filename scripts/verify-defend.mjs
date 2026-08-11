// Verify the Defend (daily chess save) bank.
//
// Defend's header (app/defend/puzzles.js) and its client's rules copy promise,
// per puzzle:
//   - BLACK to move, black NOT in check, on a wide board (at least MIN_MOVES
//     legal replies), with White already threatening mate;
//   - EXACTLY ONE black move avoids a forced checkmate within `holdFor` white
//     moves, and it is `key`. Every other legal move on the board loses;
//   - that move is a REFUTATION, not a delay: after it White has no forced mate
//     within holdFor + 1 either;
//   - at least `parries` black moves answer the immediate threat, so the key
//     always has convincing decoys beside it;
//   - the same structural guarantees Mate's engine relies on to skip castling,
//     en passant and promotion.
//
// INDEPENDENCE. Everything above is recomputed here from the FEN by a chess
// implementation written for this file: a 0x88 board of signed integers, its
// own offset tables, its own move generation, its own attack detection, its own
// SAN, and its own forced-mate search. It shares NO code with app/mate/chess.js,
// which is what the game itself plays on, so agreement between the two is real
// evidence rather than one routine agreeing with itself. Check 0 makes that
// explicit by comparing the two engines' legal-move sets on every board in the
// bank, which is 56 positions of head-to-head move generation.
//
// The one deliberate exception is check 9. `reply` is not a claim about chess,
// it is a claim that the bank stores the move the BROWSER will play, so it is
// checked against the shipped stubbornestReply() on purpose. Verifying it with
// a private copy would prove the opposite of what needs proving.
//
// Run: node scripts/verify-defend.mjs
import { PUZZLES } from '../app/defend/puzzles.js';
import { stubbornestReply, makeMateSearch } from '../app/defend/defense.js';
import { parseFen as refParseFen, legalMoves as refLegalMoves } from '../app/mate/chess.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

const MIN_MOVES = 12;      // legal black replies: the board has to be a real search
const MIN_PARRIES = 3;     // moves answering the immediate threat
const MAX_FOLLOWUP = 3;    // saving replies left after White's stubbornest try
const MOTIF_CEILING = 2;

// ─── an independent 0x88 chess core ────────────────────────────────────────
// Squares are rank*16 + file with rank 0 = the eighth rank, so index64 = sq>>4
// times 8 plus (sq & 7) and a square is on the board when (sq & 0x88) is zero.
// Pieces are signed: 1 pawn, 2 knight, 3 bishop, 4 rook, 5 queen, 6 king,
// positive White and negative Black.
const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
const FROM_CHAR = { p: P, n: N, b: B, r: R, q: Q, k: K };
const TO_CHAR = { 1: 'P', 2: 'N', 3: 'B', 4: 'R', 5: 'Q', 6: 'K' };
const KNIGHT_OFF = [-33, -31, -18, -14, 14, 18, 31, 33];
const KING_OFF = [-17, -16, -15, -1, 1, 15, 16, 17];
const DIAG = [-17, -15, 15, 17];
const ORTH = [-16, -1, 1, 16];
const on = (sq) => (sq & 0x88) === 0;
const idx64 = (sq) => (sq >> 4) * 8 + (sq & 7);
const sq88 = (i) => ((i / 8) | 0) * 16 + (i % 8);
const nameOf = (sq) => String.fromCharCode(97 + (sq & 7)) + String(8 - (sq >> 4));
const fromName = (s) => (8 - Number(s[1])) * 16 + (s.charCodeAt(0) - 97);
const uciOf = (from, to) => nameOf(from) + nameOf(to);

function boardFromFen(fen) {
  const parts = String(fen).trim().split(/\s+/);
  const bd = new Int8Array(128);
  let rank = 0, file = 0;
  for (const ch of parts[0]) {
    if (ch === '/') { rank++; file = 0; continue; }
    if (ch >= '1' && ch <= '8') { file += Number(ch); continue; }
    const kind = FROM_CHAR[ch.toLowerCase()];
    bd[rank * 16 + file] = ch === ch.toUpperCase() ? kind : -kind;
    file++;
  }
  return { bd, whiteToMove: parts[1] === 'w', parts };
}

// Pseudo-legal destinations for the piece on `sq`. `attackOnly` swaps a pawn's
// push for its two diagonals, which is what king safety cares about.
function targets(bd, sq, attackOnly) {
  const pc = bd[sq];
  if (!pc) return [];
  const white = pc > 0, kind = Math.abs(pc), out = [];
  const mine = (t) => bd[t] !== 0 && (bd[t] > 0) === white;
  const ride = (offs) => {
    for (const o of offs) {
      let t = sq + o;
      while (on(t)) { if (bd[t]) { if (!mine(t)) out.push(t); break; } out.push(t); t += o; }
    }
  };
  const hop = (offs) => { for (const o of offs) { const t = sq + o; if (on(t) && !mine(t)) out.push(t); } };
  if (kind === R) ride(ORTH);
  else if (kind === B) ride(DIAG);
  else if (kind === Q) ride(ORTH.concat(DIAG));
  else if (kind === N) hop(KNIGHT_OFF);
  else if (kind === K) hop(KING_OFF);
  else if (kind === P) {
    const dir = white ? -16 : 16;
    if (!attackOnly) { const t = sq + dir; if (on(t) && !bd[t]) out.push(t); }
    for (const s of [-1, 1]) {
      const t = sq + dir + s;
      if (!on(t)) continue;
      if (attackOnly) out.push(t);
      else if (bd[t] && !mine(t)) out.push(t);
    }
  }
  return out;
}

function attacked(bd, sq, byWhite) {
  for (let s = 0; s < 128; s++) {
    if (!on(s)) { s |= 7; continue; }
    const pc = bd[s];
    if (!pc || (pc > 0) !== byWhite) continue;
    const t = targets(bd, s, true);
    for (let i = 0; i < t.length; i++) if (t[i] === sq) return true;
  }
  return false;
}
function kingOf(bd, white) {
  for (let s = 0; s < 128; s++) { if (!on(s)) { s |= 7; continue; } if (bd[s] === (white ? K : -K)) return s; }
  return -1;
}
function inCheck(bd, white) {
  const k = kingOf(bd, white);
  return k < 0 ? false : attacked(bd, k, !white);
}
function play(bd, from, to) {
  const next = Int8Array.from(bd);
  next[to] = next[from];
  next[from] = 0;
  return next;
}
function moves(bd, white) {
  const out = [];
  for (let s = 0; s < 128; s++) {
    if (!on(s)) { s |= 7; continue; }
    const pc = bd[s];
    if (!pc || (pc > 0) !== white) continue;
    for (const t of targets(bd, s, false)) {
      const next = play(bd, s, t);
      if (!inCheck(next, white)) out.push({ from: s, to: t, uci: uciOf(s, t) });
    }
  }
  return out;
}
const mated = (bd, white) => inCheck(bd, white) && moves(bd, white).length === 0;

function san(bd, from, to) {
  const pc = bd[from];
  const kind = Math.abs(pc), white = pc > 0;
  const capture = bd[to] !== 0;
  const next = play(bd, from, to);
  const suffix = mated(next, !white) ? '#' : (inCheck(next, !white) ? '+' : '');
  if (kind === P) return `${capture ? `${nameOf(from)[0]}x` : ''}${nameOf(to)}${suffix}`;
  const rivals = moves(bd, white).filter((m) => m.to === to && m.from !== from && Math.abs(bd[m.from]) === kind);
  let dis = '';
  if (rivals.length) {
    if (!rivals.some((m) => (m.from & 7) === (from & 7))) dis = nameOf(from)[0];
    else if (!rivals.some((m) => (m.from >> 4) === (from >> 4))) dis = nameOf(from)[1];
    else dis = nameOf(from);
  }
  return `${TO_CHAR[kind]}${dis}${capture ? 'x' : ''}${nameOf(to)}${suffix}`;
}

// Independent forced-mate search. A side with no legal move is STALEMATED, not
// mated, and for Defend a stalemate is a save, so it must count as a failure to
// mate rather than as a win. Memoized on a fingerprint of the position; the
// table is per puzzle so it can never leak an answer between boards.
function makeSearch() {
  const memo = new Map();
  const fp = (bd) => { let k = ''; for (let s = 0; s < 128; s++) { if (!on(s)) { s |= 7; continue; } if (bd[s]) k += `${s.toString(36)}${bd[s]}`; } return k; };
  function forces(bd, white, n) {
    if (n <= 0) return false;
    const key = `${fp(bd)}|${white ? 1 : 0}|${n}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let res = false;
    for (const mv of moves(bd, white)) {
      const next = play(bd, mv.from, mv.to);
      if (mated(next, !white)) { res = true; break; }
      if (n === 1) continue;
      const reps = moves(next, !white);
      if (!reps.length) continue;
      let all = true;
      for (const r of reps) { if (!forces(play(next, r.from, r.to), white, n - 1)) { all = false; break; } }
      if (all) { res = true; break; }
    }
    memo.set(key, res);
    return res;
  }
  return forces;
}

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenFens = new Map();
const motifPool = new Map();

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = String(p.quizId).match(/^defend-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantLabel = p.live
    ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : null;
  if (wantLabel && p.dateLabel !== wantLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantLabel}"`);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }
  const wantHold = p.sunday ? 3 : 2;
  if (p.holdFor !== wantHold) errs.push(`holdFor ${p.holdFor} != ${wantHold} for ${p.sunday ? 'Sunday' : 'weekday'}`);

  // 1. FEN structural guarantees the shared engine depends on.
  const parts = String(p.fen).trim().split(/\s+/);
  if (parts[1] !== 'b') errs.push(`side to move is "${parts[1]}", Defend is always Black to move`);
  if (parts[2] !== '-') errs.push(`castling rights "${parts[2]}" must be "-"`);
  if (parts[3] !== '-') errs.push(`en passant "${parts[3]}" must be "-"`);

  let bd = null;
  try { ({ bd } = boardFromFen(p.fen)); } catch (e) { errs.push(`FEN failed to parse: ${e.message || e}`); }

  if (bd && !errs.length) {
    let wk = 0, bk = 0;
    for (let s = 0; s < 128; s++) {
      if (!on(s)) { s |= 7; continue; }
      const pc = bd[s];
      if (!pc) continue;
      if (pc === K) wk++;
      if (pc === -K) bk++;
      if (Math.abs(pc) === P) {
        const rank = 8 - (s >> 4);
        if (rank === 1 || rank === 2 || rank === 7 || rank === 8) {
          errs.push(`pawn on rank ${rank} (breaks the no-castling/no-ep/no-promotion guarantee)`);
        }
      }
    }
    if (wk !== 1) errs.push(`${wk} white kings, want 1`);
    if (bk !== 1) errs.push(`${bk} black kings, want 1`);
  }

  let solveNote = '';
  if (bd && !errs.length) {
    // 0. Head-to-head move generation against the engine the game actually
    //    plays on. Two implementations, two board representations, one answer.
    try {
      const ref = refParseFen(p.fen);
      const mine = moves(bd, false).map((x) => x.uci).sort().join(',');
      const theirs = refLegalMoves(ref.board, 'b').map((x) => x.uci).sort().join(',');
      if (mine !== theirs) errs.push('the two engines disagree about Black\'s legal moves');
    } catch (e) { errs.push(`cross-engine check threw: ${e.message || e}`); }

    // 2. A legal position with Black to move, and a wide one.
    if (inCheck(bd, true)) errs.push('White is in check with Black to move (illegal position)');
    if (inCheck(bd, false)) errs.push('Black starts in check; Defend boards are never a forced escape');
    const bm = moves(bd, false);
    if (bm.length < MIN_MOVES) errs.push(`only ${bm.length} legal black moves, floor is ${MIN_MOVES}`);

    if (!errs.length) {
      const forces = makeSearch();

      // 3. There must be a live threat, or nothing is being defended.
      if (!forces(bd, true, p.holdFor - 1)) {
        errs.push(`White has no forced mate in ${p.holdFor - 1}, so there is no threat to parry`);
      }

      // 4. EXACTLY ONE saving move, and 5. it is the stored key.
      const survivors = [];
      let parries = 0;
      for (const mv of bm) {
        const next = play(bd, mv.from, mv.to);
        if (!forces(next, true, p.holdFor - 1)) parries++;
        if (!forces(next, true, p.holdFor)) survivors.push(mv);
      }
      if (survivors.length === 0) errs.push(`NO black move avoids mate in ${p.holdFor}: the position is already lost`);
      else if (survivors.length > 1) {
        errs.push(`NOT UNIQUE: ${survivors.length} moves survive (${survivors.map((x) => x.uci).join(', ')})`);
      } else if (survivors[0].uci !== p.key) {
        errs.push(`the unique saving move is ${survivors[0].uci}, but key is "${p.key}"`);
      } else {
        // 6. SAN, recomputed.
        const s = san(bd, survivors[0].from, survivors[0].to);
        if (s !== p.keySan) errs.push(`san(key) = "${s}" != stored keySan "${p.keySan}"`);

        // 7. A save, not a delay.
        const after = play(bd, survivors[0].from, survivors[0].to);
        if (forces(after, true, p.holdFor + 1)) {
          errs.push(`the key only delays: White still forces mate in ${p.holdFor + 1}`);
        }

        // 8. Decoys.
        if (parries < MIN_PARRIES) errs.push(`only ${parries} moves answer the threat, floor is ${MIN_PARRIES}`);
        if (parries !== p.parries) errs.push(`recomputed parries ${parries} != stored ${p.parries}`);

        // 9. The stored reply is what the browser will play. Checked against the
        //    SHIPPED chooser on purpose (see the header).
        const refAfter = (() => {
          const rp = refParseFen(p.fen);
          let b2 = rp.board.slice();
          const f64 = idx64(survivors[0].from), t64 = idx64(survivors[0].to);
          b2[t64] = b2[f64]; b2[f64] = null;
          return b2;
        })();
        const chosen = stubbornestReply(refAfter, p.holdFor, makeMateSearch());
        if (!chosen) errs.push('White has no legal reply to the key');
        else {
          if (chosen.uci !== p.reply) errs.push(`stored reply "${p.reply}" != stubbornestReply "${chosen.uci}"`);
          const legal = moves(after, true).some((x) => x.uci === p.reply);
          if (!legal) errs.push(`stored reply "${p.reply}" is not a legal white move`);
          if (chosen.saving !== Infinity && chosen.saving > MAX_FOLLOWUP) {
            errs.push(`the follow-up is too loose: ${chosen.saving} saving replies, ceiling ${MAX_FOLLOWUP}`);
          }
          // 10. And the play-out is actually survivable from there.
          if (legal) {
            const afterReply = play(after, fromName(p.reply.slice(0, 2)), fromName(p.reply.slice(2, 4)));
            const outs = moves(afterReply, false).filter((mv) => !forces(play(afterReply, mv.from, mv.to), true, p.holdFor - 1));
            const stale = moves(afterReply, false).length === 0 && !inCheck(afterReply, false);
            if (!outs.length && !stale) errs.push('after the key and White\'s reply there is no saving move left');
          }
        }
        solveNote = `, unique save ${p.key} (${p.keySan}) confirmed independently, ${parries} parries`;
      }
    }
  }

  if (!p.motif) errs.push('missing motif');
  else {
    const bm2 = String(p.motif).match(BRITISH_RE);
    if (bm2) errs.push(`British spelling "${bm2[0]}" in motif`);
    if (p.keySan && p.motif.includes(p.keySan)) errs.push('motif names the key move in algebraic; it is shown to solvers only');
    const arr = motifPool.get(p.motif) || [];
    arr.push(p.quizId);
    motifPool.set(p.motif, arr);
  }
  if (p.fen) {
    const pos = p.fen.split(/\s+/)[0];
    seenFens.set(pos, (seenFens.get(pos) || []).concat(p.quizId));
  }

  errs.length
    ? fail(p.quizId, errs.join('; '))
    : ok(p.quizId, `hold for ${p.holdFor}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenFens) {
  if (ids.length > 1) fail('defend pool', `identical position shipped on ${ids.length} boards: ${ids.join(', ')}`);
}
for (const [motif, ids] of motifPool) {
  if (ids.length > MOTIF_CEILING) {
    fail('defend pool', `motif reused on ${ids.length} boards (ceiling ${MOTIF_CEILING}): ${ids.join(', ')} -- "${motif}"`);
  }
}

// Pool variety: the week is meant to ramp, so the bank should not be one
// difficulty repeated. Reported as a note rather than a failure because it is a
// shape claim, not a correctness one.
const weekday = PUZZLES.filter((p) => !p.sunday);
if (weekday.length) {
  const spread = new Set(weekday.map((p) => p.parries));
  if (spread.size < 3) note('defend pool', `only ${spread.size} distinct parry counts across the weekday bank; the week barely ramps`);
}

if (!BAD) {
  ok('defend pool', `${PUZZLES.length} boards, ${PUZZLES.filter((p) => p.sunday).length} Sunday, ${motifPool.size} distinct motifs, no repeated position`);
}
console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Defend boards verified.');
process.exit(BAD ? 1 : 0);
