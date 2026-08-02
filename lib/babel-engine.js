// Babel — the shared endgame engine.
//
// ONE module, used in TWO places, which is the whole point: the authoring
// script (scripts/gen-babel.mjs) computes each day's PAR with it, and the
// client (app/babel/BabelClient.jsx) plays the opponent's defence with it.
// Because both sides run the identical search with identical parameters, a
// banked par is not an estimate — it is exactly the best a player can force
// against the defence they will actually face. scripts/verify-babel.mjs
// recomputes every par from the banked position and fails on any drift.
//
// The board is 11x11 (a 15x15 is unreadable on a phone and the endgame is a
// local fight anyway), the bag is 64 tiles in near-Babelble proportions with
// no blanks and no Q, and the word list is public/tuck-dict.txt — the same
// dictionary Tuck already ships, so a player who knows one knows the other.

export const SIZE = 11;

// Premium layout. Rotationally symmetric; every row is its own palindrome, so
// the grid reads the same from any of the four sides.
//   T triple word   D double word   t triple letter   d double letter   * centre
const LAYOUT = [
  'T..d...d..T',
  '.D..t.t..D.',
  '..D..d..D..',
  'd..D...D..d',
  '.t..D.D..t.',
  '..d..*..d..',
  '.t..D.D..t.',
  'd..D...D..d',
  '..D..d..D..',
  '.D..t.t..D.',
  'T..d...d..T',
];

export const PREMIUM = LAYOUT.map((row) => row.split(''));
export const CENTRE = { r: 5, c: 5 };

export const PTS = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

// 65 tiles, every letter in near-Babelble proportion for an 11x11 board.
//
// The Q is IN, at the 1 tile its real proportion rounds to. An earlier version
// cut it on the theory that a lone Q is a dead tile, which was simply wrong:
// QI, QAT, QIN, QIS and SUQ are all in the word list, so the Q plays, and it is
// the single most-tracked tile in a real endgame. Cutting it gutted the best
// deduction in the game to fix a problem that did not exist.
//
// No blanks. That one is a real trade rather than a mistake: a blank branches
// 26 ways at every square, and the player would need a UI for choosing its
// letter. The rules say so plainly rather than implying a full bag.
export const BAG = {
  A: 5, B: 1, C: 2, D: 3, E: 7, F: 1, G: 2, H: 2, I: 5, J: 1, K: 1, L: 3, M: 2,
  N: 4, O: 5, P: 1, Q: 1, R: 4, S: 3, T: 4, U: 3, V: 1, W: 1, X: 1, Y: 1, Z: 1,
};
export const BAG_SIZE = Object.values(BAG).reduce((a, b) => a + b, 0);

export const BINGO_BONUS = 35;   // all 7 tiles in one play (self-play phase only)
export const ALPHABET = Object.keys(PTS).filter((L) => BAG[L] > 0);

// ─── lexicon ───────────────────────────────────────────────────────────────
// A trie beats a prefix Set here by an order of magnitude on memory: 115k
// words share their prefixes, so the node count lands near 250k Maps instead
// of 750k retained strings. Built once, on the client right after the
// dictionary text arrives.
export function buildLexicon(words) {
  const root = new Map();
  let nodes = 1;
  for (const raw of words) {
    const w = raw.trim().toUpperCase();
    if (!w || w.length < 2 || w.length > SIZE) continue;
    if (!/^[A-Z]+$/.test(w)) continue;
    let node = root;
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      let next = node.get(ch);
      if (!next) { next = new Map(); node.set(ch, next); nodes++; }
      node = next;
    }
    node.set('$', true);
  }
  return { root, nodes };
}

export function isWord(lex, w) {
  let node = lex.root;
  for (let i = 0; i < w.length; i++) {
    node = node.get(w[i]);
    if (!node) return false;
  }
  return node.get('$') === true;
}

// ─── board helpers ─────────────────────────────────────────────────────────
export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}
export function cloneBoard(b) { return b.map((row) => row.slice()); }
export function boardToRows(b) { return b.map((row) => row.map((x) => x || '.').join('')); }
export function rowsToBoard(rows) {
  return rows.map((row) => row.split('').map((ch) => (ch === '.' ? null : ch)));
}
export function boardIsEmpty(b) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (b[r][c]) return false;
  return true;
}
export function rackSum(rack) {
  let s = 0;
  for (const L of rack) s += PTS[L] || 0;
  return s;
}
function counts(rack) {
  const m = {};
  for (const L of rack) m[L] = (m[L] || 0) + 1;
  return m;
}

// A transposed view lets one generator handle both directions: generate across
// rows on the board, then across rows on its transpose, and flip the
// coordinates back on the way out.
function transpose(b) {
  const t = emptyBoard();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) t[c][r] = b[r][c];
  return t;
}

// ─── cross-checks ──────────────────────────────────────────────────────────
// For every empty square, which letters form a legal word in the perpendicular
// direction, and what does that perpendicular word score before premiums. A
// square with no perpendicular neighbours accepts everything and scores
// nothing. Computed once per generation pass, which is what keeps the search
// cheap enough to run live in the browser.
function crossChecks(board, lex) {
  const allow = Array.from({ length: SIZE }, () => Array(SIZE).fill(null)); // null = any
  const cscore = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const touch = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c]) continue;
      let up = '', down = '';
      let rr = r - 1;
      while (rr >= 0 && board[rr][c]) { up = board[rr][c] + up; rr--; }
      rr = r + 1;
      while (rr < SIZE && board[rr][c]) { down += board[rr][c]; rr++; }
      if (!up && !down) continue;
      touch[r][c] = true;
      let base = 0;
      for (const ch of up + down) base += PTS[ch];
      cscore[r][c] = base;
      const ok = new Set();
      for (const L of ALPHABET) if (isWord(lex, up + L + down)) ok.add(L);
      allow[r][c] = ok;
    }
  }
  return { allow, cscore, touch };
}

function premiumOf(r, c, vertical) {
  // On the transposed pass the premium grid has to be read transposed too.
  return vertical ? PREMIUM[c][r] : PREMIUM[r][c];
}

// ─── move generation ───────────────────────────────────────────────────────
// Standard anchored generation: walk each row left to right, extend a word one
// square at a time, and prune the instant the prefix leaves the trie. A move is
// legal when it lays at least one tile, forms a real word of 2+ letters, every
// perpendicular word it creates is real, and it touches what is already there
// (or covers the centre on an empty board).
//
// Returns [{ word, score, tiles: [{r,c,L}], vertical }], deduplicated and
// sorted by score descending.
export function generateMoves(board, rack, lex) {
  const out = [];
  const seen = new Set();
  const rc = counts(rack);
  const first = boardIsEmpty(board);

  for (const vertical of [false, true]) {
    const b = vertical ? transpose(board) : board;
    const { allow, cscore, touch } = crossChecks(b, lex);

    for (let r = 0; r < SIZE; r++) {
      for (let start = 0; start < SIZE; start++) {
        // Never begin mid-word: the square to the left must be empty or the edge.
        if (start > 0 && b[r][start - 1]) continue;

        const tiles = [];
        const walk = (c, node, connected, placed) => {
          // Terminate: 2+ letters, at least one tile laid, and the next square
          // is not occupied (or we ran off the board).
          if (placed > 0 && c - start >= 2 && (c >= SIZE || !b[r][c]) && node.get('$') === true) {
            const ok = first
              ? tiles.some((t) => t.r === (vertical ? CENTRE.c : CENTRE.r) && t.c === (vertical ? CENTRE.r : CENTRE.c))
              : connected;
            if (ok) {
              let word = '';
              for (let x = start; x < c; x++) {
                const t = tiles.find((q) => q.c === x);
                word += t ? t.L : b[r][x];
              }
              const score = scoreLine(b, r, start, c, tiles, cscore, vertical);
              const key = tiles.map((t) => `${t.r},${t.c},${t.L}`).join('|') + (vertical ? 'V' : 'H');
              if (!seen.has(key)) {
                seen.add(key);
                out.push({
                  word,
                  score,
                  vertical,
                  tiles: tiles.map((t) => (vertical ? { r: t.c, c: t.r, L: t.L } : { r: t.r, c: t.c, L: t.L })),
                });
              }
            }
          }
          if (c >= SIZE) return;

          const cell = b[r][c];
          if (cell) {
            // Running through a tile already on the board also connects the play.
            const next = node.get(cell);
            if (next) walk(c + 1, next, true, placed);
            return;
          }
          for (const L of ALPHABET) {
            if (!rc[L]) continue;
            const next = node.get(L);
            if (!next) continue;
            const gate = allow[r][c];
            if (gate && !gate.has(L)) continue;
            rc[L]--;
            tiles.push({ r, c, L });
            walk(c + 1, next, connected || touch[r][c], placed + 1);
            tiles.pop();
            rc[L]++;
          }
        };
        walk(start, lex.root, false, 0);
      }
    }
  }

  out.sort((a, b2) => b2.score - a.score || a.word.localeCompare(b2.word));
  return out;
}

// Score one main word plus every perpendicular word it created. Premiums apply
// only under freshly laid tiles, and a word premium multiplies the cross word
// it sits in as well, exactly as in the paper game.
function scoreLine(b, r, start, end, tiles, cscore, vertical) {
  let main = 0;
  let mult = 1;
  let cross = 0;
  const laid = new Map(tiles.map((t) => [t.c, t.L]));
  for (let x = start; x < end; x++) {
    const fresh = laid.has(x);
    const L = fresh ? laid.get(x) : b[r][x];
    let lv = PTS[L];
    if (fresh) {
      const p = premiumOf(r, x, vertical);
      if (p === 'd') lv *= 2;
      else if (p === 't') lv *= 3;
      else if (p === 'D' || p === '*') mult *= 2;
      else if (p === 'T') mult *= 3;
      if (cscore[r][x]) {
        let cw = cscore[r][x] + lv;
        if (p === 'D' || p === '*') cw *= 2;
        else if (p === 'T') cw *= 3;
        cross += cw;
      }
    }
    main += lv;
  }
  let total = main * mult + cross;
  if (tiles.length === 7) total += BINGO_BONUS;
  return total;
}

export function applyMove(board, rack, move) {
  const b = cloneBoard(board);
  const left = rack.slice();
  for (const t of move.tiles) {
    b[t.r][t.c] = t.L;
    const i = left.indexOf(t.L);
    if (i >= 0) left.splice(i, 1);
  }
  return { board: b, rack: left };
}

// ─── endgame search ────────────────────────────────────────────────────────
// Bag empty, both racks known, so this is a perfect-information game and the
// value is exact within the search policy. Negamax + alpha-beta, returning the
// spread (my future points minus theirs) for the side to move.
//
// INNER_K caps the branching at interior nodes. It is a policy choice, not an
// approximation to apologise for: par is DEFINED as the value of the game under
// this policy, and the client defends under the same policy, so the number on
// the card is exactly what a player can force. The root is uncapped, so a
// player who finds a line the engine never considered simply beats par, which
// is the good direction for the error to run.
export const INNER_K = 10;
// The transposition table keys on board + racks + passes but NOT on ply, which
// is only sound if the ply cap never actually truncates a line — otherwise the
// same position stores a different value depending on how deep it was first
// reached, and the answer changes with move order. Every non-pass move sheds at
// least one tile and two passes in a row end the game, so a 6v6 endgame cannot
// run past ~25 plies. 40 is a guard against a bug, never a real cutoff.
const MAX_PLY = 40;

export function boardKey(b) {
  let s = '';
  for (let r = 0; r < SIZE; r++) {
    const row = b[r];
    for (let c = 0; c < SIZE; c++) s += row[c] || '.';
  }
  return s;
}
const rackKey = (rack) => rack.slice().sort().join('');

// Endgames transpose relentlessly — the same board and racks arrive by a dozen
// different move orders — so a transposition table plus a per-position move
// cache is the difference between a 26-second search and a sub-second one.
// Both are scoped to a single solveEndgame call and thrown away after, so
// nothing leaks between positions or between days.
const EXACT = 0, LOWER = 1, UPPER = 2;

export function solveEndgame(board, me, opp, lex, opts = {}) {
  const innerK = opts.innerK == null ? INNER_K : opts.innerK;
  const rootK = opts.rootK == null ? Infinity : opts.rootK;
  let nodes = 0;
  const tt = new Map();
  const mc = new Map();

  function movesFor(b, bk, rack) {
    const k = bk + '#' + rackKey(rack);
    let m = mc.get(k);
    if (m) return m;
    m = generateMoves(b, rack, lex);
    if (mc.size < 40000) mc.set(k, m);
    return m;
  }

  // Take the best K by SCORE, then float the out-moves to the front of that
  // subset. Ordering and selection have to stay separate: sorting outs first
  // and then slicing would quietly drop every big scoring move on a board with
  // more than K ways to shed the last tiles.
  function candidates(all, rackLen, k) {
    const top = all.length > k ? all.slice(0, k) : all;
    const outs = [], rest = [];
    for (const mv of top) (mv.tiles.length === rackLen ? outs : rest).push(mv);
    return outs.length ? outs.concat(rest) : top;
  }

  function search(b, bk, mine, theirs, passes, alpha, beta, ply) {
    nodes++;
    if (passes >= 2 || ply >= MAX_PLY) return rackSum(theirs) - rackSum(mine);

    const key = bk + '|' + rackKey(mine) + '|' + rackKey(theirs) + '|' + passes;
    const hit = tt.get(key);
    if (hit) {
      if (hit.f === EXACT) return hit.v;
      if (hit.f === LOWER && hit.v > alpha) alpha = hit.v;
      else if (hit.f === UPPER && hit.v < beta) beta = hit.v;
      if (alpha >= beta) return hit.v;
    }
    const a0 = alpha;

    const capped = candidates(movesFor(b, bk, mine), mine.length, innerK);

    // Passing is always available and is sometimes correct: sitting on a
    // blocked board beats opening a triple word for the other side.
    let best = -search(b, bk, theirs, mine, passes + 1, -beta, -alpha, ply + 1);
    if (best > alpha) alpha = best;

    if (alpha < beta) {
      for (const mv of capped) {
        const { board: nb, rack: nr } = applyMove(b, mine, mv);
        let val;
        if (nr.length === 0) {
          // Going out: the loser's rack comes off their score and lands on mine.
          val = mv.score + 2 * rackSum(theirs);
        } else {
          val = mv.score - search(nb, boardKey(nb), theirs, nr, 0, -beta, -alpha, ply + 1);
        }
        if (val > best) best = val;
        if (best > alpha) alpha = best;
        if (alpha >= beta) break;
      }
    }

    if (tt.size < 200000) {
      tt.set(key, { v: best, f: best <= a0 ? UPPER : best >= beta ? LOWER : EXACT });
    }
    return best;
  }

  const bk = boardKey(board);
  const all = movesFor(board, bk, me);
  const rootMoves = rootK === Infinity ? all : candidates(all, me.length, rootK);
  let bestVal = -Infinity;
  let bestMove = null;

  // The pass line, evaluated first so it is the fallback on a dead board.
  bestVal = -search(board, bk, opp, me, 1, -Infinity, Infinity, 1);
  // Root moves arrive score-ordered, so scouting each one against the best
  // score so far prunes the tail hard: we only ever ask "can this beat what we
  // already have", never "what is this worth exactly".
  for (const mv of rootMoves) {
    const { board: nb, rack: nr } = applyMove(board, me, mv);
    let val;
    if (nr.length === 0) {
      val = mv.score + 2 * rackSum(opp);
    } else {
      const cv = search(nb, boardKey(nb), opp, nr, 0, -Infinity, mv.score - bestVal, 1);
      val = mv.score - cv;
    }
    if (val > bestVal) { bestVal = val; bestMove = mv; }
  }
  return { value: bestVal, move: bestMove, nodes };
}

// The defence the client actually plays. This function IS the opponent: the
// browser calls it on every reply, and the bank's par is measured against it,
// so it must never change without regenerating and re-verifying the bank.
export function bestReply(board, me, opp, lex) {
  return solveEndgame(board, me, opp, lex, { rootK: INNER_K, innerK: INNER_K });
}

// ─── par ───────────────────────────────────────────────────────────────────
// Par is the spread our solver ACHIEVES from the player's seat against that
// defence, playing the position out move by move. It is not a theoretical
// optimum and does not pretend to be, which matters: a "best possible" number
// derived from one search policy and then defended by a different one is a par
// nobody can hit, and that is precisely the bug this replaced. Defining par as
// a real playout makes it reachable by construction — a player who finds these
// moves lands exactly on it — while leaving plenty of room to beat it, because
// the player may use the full dictionary and the solver may not.
//
// Deterministic: same position, same number, every time. scripts/verify-babel.mjs
// re-runs this for every banked day.
export function solveLine(board, me0, foe0, lex) {
  let b = board, me = me0.slice(), foe = foe0.slice();
  let spread = 0, passes = 0, guard = 0;
  const line = [];
  while (guard++ < 40) {
    // The player searches every legal move at its own root; the opponent is
    // capped, exactly as in the browser.
    const { move } = solveEndgame(b, me, foe, lex, { rootK: Infinity, innerK: INNER_K });
    if (!move) {
      passes++;
      line.push({ who: 'you', word: 'pass', score: 0 });
      if (passes >= 2) return { spread: spread + rackSum(foe) - rackSum(me), line, end: 'passes' };
    } else {
      passes = 0;
      const res = applyMove(b, me, move);
      b = res.board; me = res.rack;
      spread += move.score;
      line.push({ who: 'you', word: move.word, score: move.score });
      if (!me.length) return { spread: spread + 2 * rackSum(foe), line, end: 'you-out' };
    }
    const rep = bestReply(b, foe, me, lex);
    if (!rep.move) {
      passes++;
      line.push({ who: 'foe', word: 'pass', score: 0 });
      if (passes >= 2) return { spread: spread + rackSum(foe) - rackSum(me), line, end: 'passes' };
    } else {
      passes = 0;
      const res = applyMove(b, foe, rep.move);
      b = res.board; foe = res.rack;
      spread -= rep.move.score;
      line.push({ who: 'foe', word: rep.move.word, score: rep.move.score });
      if (!foe.length) return { spread: spread - 2 * rackSum(me), line, end: 'foe-out' };
    }
  }
  return { spread, line, end: 'guard' };
}

// ─── validating a human's play ─────────────────────────────────────────────
// The client builds a move from tiles the player dropped on the board; this
// checks it against the same rules the generator enforces and returns either
// { ok: true, score, words } or { ok: false, why }.
//
// `dict` is anything with a .has(WORD) taking an uppercase string, which lets
// the client validate against the full 115k list as a plain Set while the
// engine keeps its own trie. The player is therefore allowed vocabulary the
// engine will never reach for, which is the right way round.
export function validatePlacement(board, tiles, dict) {
  if (!tiles.length) return { ok: false, why: 'Place at least one tile.' };
  const rows = new Set(tiles.map((t) => t.r));
  const cols = new Set(tiles.map((t) => t.c));
  const vertical = rows.size > 1;
  if (rows.size > 1 && cols.size > 1) return { ok: false, why: 'One line at a time.' };

  const b = cloneBoard(board);
  for (const t of tiles) {
    if (board[t.r][t.c]) return { ok: false, why: 'That square is taken.' };
    b[t.r][t.c] = t.L;
  }

  // No gaps in the laid line.
  if (vertical) {
    const c = tiles[0].c;
    const rs = tiles.map((t) => t.r).sort((a, z) => a - z);
    for (let r = rs[0]; r <= rs[rs.length - 1]; r++) if (!b[r][c]) return { ok: false, why: 'Leave no gap.' };
  } else {
    const r = tiles[0].r;
    const cs = tiles.map((t) => t.c).sort((a, z) => a - z);
    for (let c = cs[0]; c <= cs[cs.length - 1]; c++) if (!b[r][c]) return { ok: false, why: 'Leave no gap.' };
  }

  const first = boardIsEmpty(board);
  let connected = first ? tiles.some((t) => t.r === CENTRE.r && t.c === CENTRE.c) : false;
  if (!first) {
    for (const t of tiles) {
      const nb = [[t.r - 1, t.c], [t.r + 1, t.c], [t.r, t.c - 1], [t.r, t.c + 1]];
      for (const [rr, cc] of nb) {
        if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE) continue;
        if (board[rr][cc]) { connected = true; break; }
      }
      if (connected) break;
    }
  }
  if (!connected) return { ok: false, why: first ? 'The first word must cross the star.' : 'Your word has to touch the board.' };

  // Collect every word the play forms: the main line plus one cross word per tile.
  const words = [];
  const seen = new Set();
  const collect = (r, c, vert) => {
    let sr = r, sc = c;
    while (vert ? sr > 0 && b[sr - 1][c] : sc > 0 && b[r][sc - 1]) { if (vert) sr--; else sc--; }
    let w = '';
    const cells = [];
    let rr = sr, cc = sc;
    while (rr < SIZE && cc < SIZE && b[rr][cc]) {
      w += b[rr][cc];
      cells.push({ r: rr, c: cc });
      if (vert) rr++; else cc++;
    }
    if (w.length < 2) return;
    const key = `${sr},${sc},${vert},${w}`;
    if (seen.has(key)) return;
    seen.add(key);
    words.push({ word: w, cells });
  };
  collect(tiles[0].r, tiles[0].c, vertical);
  for (const t of tiles) collect(t.r, t.c, !vertical);
  if (!words.length) return { ok: false, why: 'A word has to be at least two letters.' };

  const bad = words.filter((w) => !dict.has(w.word));
  if (bad.length) return { ok: false, why: `${bad.map((w) => w.word).join(', ')} — not in the dictionary.`, bad: bad.map((w) => w.word) };

  // Score every word, premiums under fresh tiles only.
  const freshKeys = new Set(tiles.map((t) => `${t.r},${t.c}`));
  let total = 0;
  const detail = [];
  for (const w of words) {
    let sum = 0, mult = 1;
    for (const cell of w.cells) {
      let lv = PTS[b[cell.r][cell.c]];
      if (freshKeys.has(`${cell.r},${cell.c}`)) {
        const p = PREMIUM[cell.r][cell.c];
        if (p === 'd') lv *= 2;
        else if (p === 't') lv *= 3;
        else if (p === 'D' || p === '*') mult *= 2;
        else if (p === 'T') mult *= 3;
      }
      sum += lv;
    }
    const ws = sum * mult;
    detail.push({ word: w.word, score: ws });
    total += ws;
  }
  if (tiles.length === 7) total += BINGO_BONUS;
  return { ok: true, score: total, words: detail };
}
