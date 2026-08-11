// A fast forced-mate search, used ONLY to sift candidate positions for the
// Defend bank.
//
// WHY THIS EXISTS. app/mate/chess.js is written to be obviously correct rather
// than quick: it rebuilds a 64-element board for every move it tries, finds the
// king by scanning the board, and answers "is this square attacked" by walking
// every enemy piece's move list. That is fine for a browser judging one move,
// and far too slow to sift the hundreds of thousands of random positions a
// hold-for-four bank needs. This core keeps a single 0x88 board, makes and
// unmakes moves in place, and answers attack queries by casting rays outward
// from the square in question, which is roughly forty times faster in practice.
//
// WHY IT IS SAFE TO BE A SEPARATE IMPLEMENTATION. It never decides what ships.
// The generator uses it to find candidates and then re-runs the WHOLE claim
// (every legal move, the parry count, uniqueness, the deeper refutation) through
// app/defend/defense.js, the engine the browser actually plays, before writing a
// board out. scripts/verify-defend.mjs then re-derives all of it again with a
// third implementation. So a bug in here can only cost throughput or lose a
// candidate; it cannot put a wrong board in the bank.
//
// Squares are rank*16 + file with rank 0 = the eighth rank, matching the shipped
// engine's index64 = rank*8 + file after a shift. Pieces are signed: 1 pawn,
// 2 knight, 3 bishop, 4 rook, 5 queen, 6 king, positive White, negative Black.

export const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
const KNIGHT = [-33, -31, -18, -14, 14, 18, 31, 33];
const KING = [-17, -16, -15, -1, 1, 15, 16, 17];
const DIAG = [-17, -15, 15, 17];
const ORTH = [-16, -1, 1, 16];
export const on = (sq) => (sq & 0x88) === 0;
export const to64 = (sq) => (sq >> 4) * 8 + (sq & 7);
export const from64 = (i) => ((i / 8) | 0) * 16 + (i % 8);
export const nameOf = (sq) => String.fromCharCode(97 + (sq & 7)) + String(8 - (sq >> 4));
export const uciOf = (f, t) => nameOf(f) + nameOf(t);

// Is `sq` attacked by `white`? Cast rays OUT from the square rather than walking
// every enemy piece, so the cost is a constant thirty-odd probes instead of
// scaling with the material on the board.
export function attacked(bd, sq, white) {
  const pawn = white ? P : -P;
  if (white) { if (bd[sq + 15] === pawn || bd[sq + 17] === pawn) return true; }
  else { if (bd[sq - 15] === pawn || bd[sq - 17] === pawn) return true; }
  const kn = white ? N : -N;
  for (let i = 0; i < 8; i++) { const t = sq + KNIGHT[i]; if (on(t) && bd[t] === kn) return true; }
  const kg = white ? K : -K;
  for (let i = 0; i < 8; i++) { const t = sq + KING[i]; if (on(t) && bd[t] === kg) return true; }
  for (let i = 0; i < 4; i++) {
    let t = sq + DIAG[i];
    while (on(t)) {
      const p = bd[t];
      if (p) { const a = white ? p : -p; if (a === B || a === Q) return true; break; }
      t += DIAG[i];
    }
  }
  for (let i = 0; i < 4; i++) {
    let t = sq + ORTH[i];
    while (on(t)) {
      const p = bd[t];
      if (p) { const a = white ? p : -p; if (a === R || a === Q) return true; break; }
      t += ORTH[i];
    }
  }
  return false;
}

export function kingSq(bd, white) {
  const want = white ? K : -K;
  for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } if (bd[s] === want) return s; }
  return -1;
}
export const inCheck = (bd, white) => {
  const k = kingSq(bd, white);
  return k < 0 ? false : attacked(bd, k, !white);
};

// Pseudo-legal moves packed into `out` as (from << 8) | to, returning the count.
// The caller filters for legality by making the move and asking whether its own
// king is attacked, which is the one rule that covers pins, discovered checks
// and king walks at once.
function pseudo(bd, white, out) {
  let n = 0;
  for (let s = 0; s < 128; s++) {
    if (s & 0x88) { s += 7; continue; }
    const pc = bd[s];
    if (!pc || (pc > 0) !== white) continue;
    const kind = pc > 0 ? pc : -pc;
    if (kind === N || kind === K) {
      const offs = kind === N ? KNIGHT : KING;
      for (let i = 0; i < 8; i++) {
        const t = s + offs[i];
        if (!on(t)) continue;
        const q = bd[t];
        if (q && (q > 0) === white) continue;
        out[n++] = (s << 8) | t;
      }
    } else if (kind === P) {
      const dir = white ? -16 : 16;
      let t = s + dir;
      if (on(t) && !bd[t]) out[n++] = (s << 8) | t;
      for (const d of [-1, 1]) {
        t = s + dir + d;
        if (!on(t)) continue;
        const q = bd[t];
        if (q && (q > 0) !== white) out[n++] = (s << 8) | t;
      }
    } else {
      const dirs = kind === B ? DIAG : kind === R ? ORTH : DIAG.concat(ORTH);
      for (let i = 0; i < dirs.length; i++) {
        let t = s + dirs[i];
        while (on(t)) {
          const q = bd[t];
          if (q) { if ((q > 0) !== white) out[n++] = (s << 8) | t; break; }
          out[n++] = (s << 8) | t;
          t += dirs[i];
        }
      }
    }
  }
  return n;
}

// Legal moves as an array of (from << 8) | to. Allocates, so it is used at the
// shallow levels only; the search below works out of preallocated buffers.
export function legal(bd, white) {
  const buf = new Int32Array(220);
  const n = pseudo(bd, white, buf);
  const out = [];
  for (let i = 0; i < n; i++) {
    const m = buf[i], f = m >> 8, t = m & 255;
    const cap = bd[t];
    bd[t] = bd[f]; bd[f] = 0;
    if (!inCheck(bd, white)) out.push(m);
    bd[f] = bd[t]; bd[t] = cap;
  }
  return out;
}

// Zobrist keys, so the memo is a cheap number pair rather than a rebuilt string.
const Z = (() => {
  let s = 0x2f6e2b1;
  const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return s >>> 0; };
  const t = [];
  for (let p = 0; p < 13; p++) { const row = new Uint32Array(256); for (let q = 0; q < 128; q++) row[q] = rnd(); t.push(row); }
  const t2 = [];
  for (let p = 0; p < 13; p++) { const row = new Uint32Array(256); for (let q = 0; q < 128; q++) row[q] = rnd(); t2.push(row); }
  return { t, t2 };
})();
const zi = (pc) => (pc > 0 ? pc : 6 - pc);   // 1..6 white, 7..12 black
function hash(bd) {
  let h1 = 0, h2 = 0;
  for (let s = 0; s < 128; s++) {
    if (s & 0x88) { s += 7; continue; }
    const pc = bd[s];
    if (!pc) continue;
    const i = zi(pc);
    h1 ^= Z.t[i][s]; h2 ^= Z.t2[i][s];
  }
  return `${h1},${h2}`;
}

// Does `white`, to move, force checkmate within n of its own moves? A side with
// no legal move is STALEMATED, not mated, which for Defend is a save, so it has
// to count as a failure to mate.
export function makeFastSearch() {
  const memo = new Map();
  const bufs = [];
  const bufAt = (d) => (bufs[d] || (bufs[d] = new Int32Array(220)));

  function forces(bd, white, n, depth = 0) {
    if (n <= 0) return false;
    const key = `${hash(bd)}|${white ? 1 : 0}|${n}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    // Both plies work out of preallocated buffers indexed by depth. Allocating a
    // move list per node was the single biggest cost in the first version of
    // this, because the search visits millions of nodes and every one of those
    // arrays became garbage.
    const mine = bufAt(depth);
    const theirs = bufAt(depth + 1);
    const cnt = pseudo(bd, white, mine);
    let res = false;
    for (let i = 0; i < cnt && !res; i++) {
      const m = mine[i], f = m >> 8, t = m & 255;
      const cap = bd[t];
      bd[t] = bd[f]; bd[f] = 0;
      if (!inCheck(bd, white)) {
        const rcnt = pseudo(bd, !white, theirs);
        let anyLegal = false, all = true;
        for (let j = 0; j < rcnt; j++) {
          const r = theirs[j], rf = r >> 8, rt = r & 255;
          const rcap = bd[rt];
          bd[rt] = bd[rf]; bd[rf] = 0;
          if (!inCheck(bd, !white)) {
            anyLegal = true;
            if (n > 1) { if (!forces(bd, white, n - 1, depth + 2)) all = false; }
            else all = false;                            // no budget left to mate
          }
          bd[rf] = bd[rt]; bd[rt] = rcap;
          if (anyLegal && !all) break;
        }
        if (!anyLegal) { if (inCheck(bd, !white)) res = true; }   // mate, not stalemate
        else if (all) res = true;
      }
      bd[f] = bd[t]; bd[t] = cap;
    }
    memo.set(key, res);
    return res;
  }
  return forces;
}
