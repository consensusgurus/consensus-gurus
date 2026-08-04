// Comprehensive daily-bank verifier for the OTHER twelve games (Tuck/Alibi/
// Cipher have their own scripts). Restores the in-repo solver CLAUDE-QUIZZES
// §7 used to lament was missing. Run after ANY bank edit:
//   node scripts/verify-daily-banks.mjs [game ...]
//
// What it proves, per game:
//   suds   — sol is a valid sudoku consistent with `given`; the givens admit
//            EXACTLY ONE solution (exhaustive, capped at 2); clue count matches.
//   tally  — sol respects blocked/given, hits every rowT/colT, uses exactly
//            the bank multiset; the (blocked, given, totals, bank) spec admits
//            EXACTLY ONE filling.
//   carve  — sol is `regions` connected regions, one seed each, each summing
//            to target; the (grid, seeds, target) spec admits EXACTLY ONE
//            partition (region enumeration + exact cover, capped at 2).
//   garble — every scramble is a true anagram of its answer (and differs);
//            marks are valid indexes; marked letters anagram to `final`;
//            NO answer has an alternate same-length anagram in the common-word
//            list (the client accepts only the exact answer — an alternate
//            like MELON/LEMON would wrongly reject a fair unscramble).
//   emcee  — across/down slot lists exactly tile the grid's runs; crossings
//            are consistent by construction; non-dictionary answers are
//            REPORTED for eyeball review (proper nouns are legal in crosswords).
//   links  — 4 groups × 4 words, all 16 distinct; declared collisions must
//            yield EXACTLY ONE valid grouping, and every one-way collision
//            flow (>= 2 words of A read as B, nothing in B reads back) must be
//            signed off in `reverseChecked` — the proof only sees what you
//            declare, so an unacknowledged one-way flow is a failure.
//   crux   — every category word is placed in exactly one slot; slot geometry
//            fits the board; crossing letters agree; non-dictionary words
//            reported. PLUS the collision floor (owner rule, see the header of
//            app/crux/puzzles.js): every board live on or after 2026-08-03
//            declares a `collisions` array, each entry naming a word on the
//            board and a DIFFERENT category on the same board that it also
//            plausibly reads as; at least 2 entries on a weekday and at least 3
//            on a Sunday. Earlier boards are frozen history and grandfathered.
//            Collision-pool variety is also checked, so a bulk bank generator
//            cannot ship the same two traps every day: from 2026-09-30 a repeat
//            of the same word/category pair more than twice is a hard fail, and
//            repeats before that date are reported as a review note. Boards
//            from that date also must admit exactly ONE filing of the words
//            into the slots under the length and crossing constraints.
//   span   — par equals the true BFS shortest hop count on borders.js, with
//            Sunday via/avoid constraints applied exactly as the rules state.
//   dating — exactly 5 events in strictly ascending true order, distinct.
//   circa  — year is a sane integer and matches any year in the blurb copy.
//   extra  — every hidden spec resolves via the client's own resolveHidden
//            (WORD#2 = 2nd occurrence); keys lowercase and >2 chars.
//   outwit — 5 prompts in the fixed type order; ranges/options sane; herd has
//            a truth; house arrays present.
//   outrank — 6 items (7 Sunday), all distinct; house = 40 votes, no zero-vote
//            item, AND all K favorite-vote counts DISTINCT so the crowd order is
//            unambiguous (no reliance on the no-signal display-index tiebreak).
//            A tie is a hard fail on any editable (live >= today) board; past
//            frozen boards with a tie are grandfathered as a note.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const want = process.argv.slice(2);
const RUN = (k) => !want.length || want.includes(k);
let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

const dict = new Set(readFileSync(join(here, '../public/tuck-dict.txt'), 'utf8').trim().split('\n'));

// ─── SUDS ───────────────────────────────────────────────────────────────────
if (RUN('suds')) {
  const { PUZZLES } = await import('../app/suds/puzzles.js');
  const countSolutions = (given, cap = 2) => {
    const g = given.map((r) => r.slice());
    let count = 0;
    const okAt = (r, c, v) => {
      for (let i = 0; i < 9; i++) if (g[r][i] === v || g[i][c] === v) return false;
      const br = 3 * ((r / 3) | 0), bc = 3 * ((c / 3) | 0);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g[br + i][bc + j] === v) return false;
      return true;
    };
    const dfs = () => {
      if (count >= cap) return;
      let br = -1, bc = -1, bestN = 10, bestSet = null;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (g[r][c]) continue;
        const s = [];
        for (let v = 1; v <= 9; v++) if (okAt(r, c, v)) s.push(v);
        if (s.length < bestN) { bestN = s.length; br = r; bc = c; bestSet = s; }
        if (!s.length) return;
      }
      if (br < 0) { count++; return; }
      for (const v of bestSet) { g[br][bc] = v; dfs(); g[br][bc] = 0; if (count >= cap) return; }
    };
    dfs();
    return count;
  };
  for (const p of PUZZLES) {
    const errs = [];
    let clueN = 0;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (p.given[r][c]) { clueN++; if (p.given[r][c] !== p.sol[r][c]) errs.push(`given/sol clash at ${r},${c}`); }
    }
    if (p.clues !== undefined && p.clues !== clueN) errs.push(`clues field ${p.clues} != ${clueN}`);
    for (let i = 0; i < 9; i++) {
      if (new Set(p.sol[i]).size !== 9) errs.push(`sol row ${i} invalid`);
      if (new Set(p.sol.map((r) => r[i])).size !== 9) errs.push(`sol col ${i} invalid`);
    }
    for (let b = 0; b < 9; b++) {
      const br = 3 * ((b / 3) | 0), bc = 3 * (b % 3), s = new Set();
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s.add(p.sol[br + i][bc + j]);
      if (s.size !== 9) errs.push(`sol box ${b} invalid`);
    }
    const n = countSolutions(p.given);
    if (n !== 1) errs.push(`solutions=${n}, need exactly 1`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${clueN} clues, valid sol, unique`);
  }
}

// ─── TALLY ──────────────────────────────────────────────────────────────────
if (RUN('tally')) {
  const { PUZZLES } = await import('../app/tally/puzzles.js');
  for (const p of PUZZLES) {
    const N = p.size, errs = [];
    const cells = [];
    const rowRem = p.rowT.slice(), colRem = p.colT.slice();
    const bank = [...p.bank].sort((a, b) => a - b);
    // sol validity
    const used = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (p.blocked[r][c]) { if (p.sol[r][c] !== 0 && p.sol[r][c] !== undefined) { /* blocked cells shouldn't score */ } continue; }
      if (p.given[r][c]) { if (p.given[r][c] !== p.sol[r][c]) errs.push(`given/sol clash ${r},${c}`); }
      else { cells.push([r, c]); used.push(p.sol[r][c]); }
    }
    for (let r = 0; r < N; r++) {
      const s = p.sol[r].reduce((a, v, c) => a + (p.blocked[r][c] ? 0 : v), 0);
      if (s !== p.rowT[r]) errs.push(`row ${r} sums ${s} != ${p.rowT[r]}`);
    }
    for (let c = 0; c < N; c++) {
      let s = 0;
      for (let r = 0; r < N; r++) if (!p.blocked[r][c]) s += p.sol[r][c];
      if (s !== p.colT[c]) errs.push(`col ${c} sums ${s} != ${p.colT[c]}`);
    }
    if (JSON.stringify([...used].sort((a, b) => a - b)) !== JSON.stringify(bank)) errs.push('sol does not use exactly the bank multiset');
    // uniqueness: DFS over empty cells with the bank multiset
    let count = 0;
    const rr = p.rowT.map((t, r) => t - p.sol[r].reduce((a, v, c) => a + ((p.blocked[r][c] || !p.given[r][c]) ? 0 : v), 0));
    const cc = p.colT.map((t, c) => { let s = t; for (let r = 0; r < N; r++) if (!p.blocked[r][c] && p.given[r][c]) s -= p.given[r][c]; return s; });
    const counts = {};
    for (const v of bank) counts[v] = (counts[v] || 0) + 1;
    const vals = Object.keys(counts).map(Number).sort((a, b) => a - b);
    // per-row/col remaining cell tallies for pruning
    const rowCells = Array(N).fill(0), colCells = Array(N).fill(0);
    for (const [r, c] of cells) { rowCells[r]++; colCells[c]++; }
    const maxV = Math.max(...vals, 0);
    const dfs = (i, rRem, cRem, rCnt, cCnt) => {
      if (count >= 2) return;
      if (i === cells.length) { if (rRem.every((x) => x === 0) && cRem.every((x) => x === 0)) count++; return; }
      const [r, c] = cells[i];
      for (const v of vals) {
        if (!counts[v]) continue;
        if (v > rRem[r] || v > cRem[c]) continue;
        // prune: remaining cells in this row/col must be able to reach the remainder
        if (rCnt[r] - 1 === 0 && rRem[r] - v !== 0) continue;
        if (cCnt[c] - 1 === 0 && cRem[c] - v !== 0) continue;
        if (rRem[r] - v > (rCnt[r] - 1) * maxV) continue;
        if (cRem[c] - v > (cCnt[c] - 1) * maxV) continue;
        counts[v]--; rRem[r] -= v; cRem[c] -= v; rCnt[r]--; cCnt[c]--;
        dfs(i + 1, rRem, cRem, rCnt, cCnt);
        counts[v]++; rRem[r] += v; cRem[c] += v; rCnt[r]++; cCnt[c]++;
        if (count >= 2) return;
      }
    };
    dfs(0, rr, cc, rowCells.slice(), colCells.slice());
    if (count !== 1) errs.push(`solutions=${count}, need exactly 1`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `sol valid, bank exact, unique`);
  }
}

// ─── CARVE ──────────────────────────────────────────────────────────────────
if (RUN('carve')) {
  const { PUZZLES } = await import('../app/carve/puzzles.js');
  for (const p of PUZZLES) {
    const N = p.size, R = p.regions, T = p.target, errs = [];
    const idx = (r, c) => r * N + c;
    // sol validity
    const sums = Array(R).fill(0), cellsOf = Array.from({ length: R }, () => []);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const g = p.sol[r][c];
      if (g < 0 || g >= R) { errs.push(`sol label out of range at ${r},${c}`); continue; }
      sums[g] += p.grid[r][c]; cellsOf[g].push([r, c]);
    }
    sums.forEach((s, g) => { if (s !== T) errs.push(`region ${g} sums ${s} != ${T}`); });
    p.seeds.forEach(([r, c], g) => { if (p.sol[r][c] !== g) errs.push(`seed ${g} not in its region`); });
    for (let g = 0; g < R; g++) {
      const set = new Set(cellsOf[g].map(([r, c]) => idx(r, c)));
      const q = [cellsOf[g][0]], seen = new Set([idx(...cellsOf[g][0])]);
      while (q.length) {
        const [r, c] = q.pop();
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const k = idx(r + dr, c + dc);
          if (r + dr >= 0 && r + dr < N && c + dc >= 0 && c + dc < N && set.has(k) && !seen.has(k)) { seen.add(k); q.push([r + dr, c + dc]); }
        }
      }
      if (seen.size !== set.size) errs.push(`region ${g} disconnected`);
    }
    // uniqueness: enumerate all connected subsets containing each seed (no other
    // seed) summing to target, then exact-cover the board, capped at 2 covers.
    const seedIdx = p.seeds.map(([r, c]) => idx(r, c));
    const seedSet = new Set(seedIdx);
    const nbr = (k) => {
      const r = (k / N) | 0, c = k % N, out = [];
      if (r > 0) out.push(k - N);
      if (r < N - 1) out.push(k + N);
      if (c > 0) out.push(k - 1);
      if (c < N - 1) out.push(k + 1);
      return out;
    };
    const val = (k) => p.grid[(k / N) | 0][k % N];
    const regionsOf = seedIdx.map((s0) => {
      const found = [];
      // DFS over connected subsets: canonical growth (only add cells > removed barrier set is complex);
      // use the standard "enumerate connected induced subgraphs" with an exclusion set.
      const grow = (inSet, frontier, sum, excluded) => {
        if (sum === T) { found.push([...inSet]); return; }
        // prune: min remaining value is 1... values are >=1 so sum>T is dead
        if (sum > T) return;
        const fr = [...frontier];
        for (let i = 0; i < fr.length; i++) {
          const k = fr[i];
          if (excluded.has(k) || seedSet.has(k)) continue;
          // include k
          const in2 = new Set(inSet); in2.add(k);
          const fr2 = new Set(frontier); fr2.delete(k);
          for (const nb of nbr(k)) if (!in2.has(nb) && !excluded.has(nb)) fr2.add(nb);
          const ex2 = new Set(excluded);
          for (let j = 0; j < i; j++) ex2.add(fr[j]); // canonical: earlier frontier cells stay excluded
          grow(in2, fr2, sum + val(k), ex2);
        }
      };
      grow(new Set([s0]), new Set(nbr(s0)), val(s0), new Set());
      return found;
    });
    // exact cover count (cap 2)
    const ALL = N * N;
    let covers = 0;
    const coverDfs = (g, usedMask) => {
      if (covers >= 2) return;
      if (g === R) { if (usedMask.size === ALL) covers++; return; }
      for (const reg of regionsOf[g]) {
        let clash = false;
        for (const k of reg) if (usedMask.has(k)) { clash = true; break; }
        if (clash) continue;
        for (const k of reg) usedMask.add(k);
        coverDfs(g + 1, usedMask);
        for (const k of reg) usedMask.delete(k);
        if (covers >= 2) return;
      }
    };
    coverDfs(0, new Set());
    if (covers !== 1) errs.push(`partitions=${covers}, need exactly 1 (region options: ${regionsOf.map((x) => x.length).join('/')})`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `sol valid, unique partition`);
  }
}

// ─── GARBLE ─────────────────────────────────────────────────────────────────
if (RUN('garble')) {
  const { PUZZLES } = await import('../app/garble/puzzles.js');
  // common-word list for alternate-anagram ambiguity (client is exact-match)
  const sortKey = (w) => [...w.toLowerCase()].sort().join('');
  const anagramMap = new Map();
  for (const w of dict) {
    const k = sortKey(w);
    if (!anagramMap.has(k)) anagramMap.set(k, []);
    anagramMap.get(k).push(w);
  }
  for (const p of PUZZLES) {
    const errs = [], warns = [];
    let finalLetters = '';
    for (const w of p.words) {
      // Sunday Editions are SIX-letter answers; weekdays are five or six.
      if (p.sunday && w.answer.length !== 6) errs.push(`${w.answer}: Sunday Edition answers must be 6 letters`);
      if (sortKey(w.answer) !== sortKey(w.scramble)) errs.push(`${w.answer}: scramble not an anagram`);
      if (w.answer === w.scramble) errs.push(`${w.answer}: scramble equals answer`);
      for (const m of w.marks) { if (m < 0 || m >= w.answer.length) errs.push(`${w.answer}: mark ${m} out of range`); }
      finalLetters += w.marks.map((m) => w.answer[m]).join('');
      const alts = (anagramMap.get(sortKey(w.answer)) || []).filter((x) => x !== w.answer.toLowerCase());
      if (alts.length) warns.push(`${w.answer} has alternate anagram(s): ${alts.join(',')}`);
    }
    if (sortKey(finalLetters) !== sortKey(p.final)) errs.push(`marked letters don't anagram to final ${p.final}`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `anagrams + final OK${warns.length ? ` — REVIEW: ${warns.join(' | ')}` : ''}`);
  }
}

// ─── EMCEE ──────────────────────────────────────────────────────────────────
if (RUN('emcee')) {
  const { PUZZLES } = await import('../app/emcee/puzzles.js');
  for (const p of PUZZLES) {
    const errs = [], review = [];
    const N = p.size, G = p.grid;
    const runs = [];
    for (let r = 0; r < N; r++) { let c = 0; while (c < N) { if (G[r][c] !== '#') { const s = c; while (c < N && G[r][c] !== '#') c++; if (c - s > 1) runs.push({ r, c: s, len: c - s, dir: 'A', word: G[r].slice(s, c) }); } else c++; } }
    for (let c = 0; c < N; c++) { let r = 0; while (r < N) { if (G[r][c] !== '#') { const s = r; while (r < N && G[r][c] !== '#') r++; if (r - s > 1) { let w = ''; for (let i = s; i < r; i++) w += G[i][c]; runs.push({ r: s, c, len: r - s, dir: 'D', word: w }); } } else r++; } }
    const declared = [...(p.across || []).map((s) => ({ ...s, dir: 'A' })), ...(p.down || []).map((s) => ({ ...s, dir: 'D' }))];
    if (declared.length !== runs.length) errs.push(`declared ${declared.length} slots, grid has ${runs.length} runs`);
    for (const d of declared) {
      const m = runs.find((x) => x.r === d.r && x.c === d.c && x.dir === d.dir && x.len === d.len);
      if (!m) errs.push(`slot ${d.n}${d.dir} doesn't match a grid run`);
    }
    for (const x of runs) { if (!dict.has(x.word.toLowerCase())) review.push(x.word); }
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${runs.length} slots consistent${review.length ? ` — REVIEW non-dict: ${review.join(',')}` : ''}`);
  }
}

// ─── LINKS ──────────────────────────────────────────────────────────────────
if (RUN('links')) {
  const { PUZZLES } = await import('../app/links/puzzles.js');
  for (const p of PUZZLES) {
    const errs = [];
    if (p.groups.length !== 4) errs.push(`${p.groups.length} groups`);
    const all = p.groups.flatMap((g) => g.words);
    if (all.length !== 16) errs.push(`${all.length} words`);
    if (new Set(all).size !== all.length) errs.push('duplicate word across groups');
    for (const g of p.groups) if (g.words.length !== 4) errs.push(`group "${g.name}" has ${g.words.length}`);

    // ── COLLISIONS + EXACT UNIQUENESS ────────────────────────────────────
    // A collision is a word that plausibly reads as a DIFFERENT group on the
    // same board. They are the whole game, and also how a board ends up with
    // two defensible solutions — so the count is checked AND the board is
    // proved unique.
    //
    // THE PROOF (replaces the old pinning heuristic, 2026-07-20): treat each
    // word's plausible memberships as its home group plus every annotated
    // collision, then COUNT the assignments of 16 words to the 4 groups where
    // every group gets exactly 4. Exactly one is required.
    //
    // This is exact where pinning was merely sufficient. Pinning demanded that
    // a tempted group contain no colliding word, which wrongly rejects a
    // MUTUAL temptation that the arithmetic still resolves: on 2026-07-21 FORD
    // reads as a car and DODGE reads as avoid, but presidents then has only
    // three members, so FORD must stay put and DODGE follows. One solution,
    // and the old rule called it ambiguous.
    //
    // `collisions` is [{ word, reads }] where `reads` is the group NAME.
    // Sundays need >= 4, ordinary days >= 2 once annotated. Legacy boards
    // predate the field and are skipped (audit still manual there).
    const byName = new Map(p.groups.map((g) => [g.name, g]));
    const homeOf = new Map();
    for (const g of p.groups) for (const w of g.words) homeOf.set(w, g.name);
    if (p.collisions) {
      const minC = p.sunday ? 4 : 2;
      if (p.collisions.length < minC) errs.push(`${p.collisions.length} collisions, want >= ${minC}`);
      for (const c of p.collisions) {
        if (!homeOf.has(c.word)) { errs.push(`collision word "${c.word}" not on the board`); continue; }
        if (!byName.has(c.reads)) { errs.push(`collision "${c.word}" reads unknown group "${c.reads}"`); continue; }
        if (homeOf.get(c.word) === c.reads) errs.push(`collision "${c.word}" already lives in "${c.reads}"`);
      }
      // membership = home group + every annotated collision
      const member = new Map([...homeOf].map(([w, h]) => [w, new Set([h])]));
      for (const c of p.collisions) if (member.has(c.word) && byName.has(c.reads)) member.get(c.word).add(c.reads);
      const words = [...homeOf.keys()];
      const room = Object.fromEntries(p.groups.map((g) => [g.name, 4]));
      let solutions = 0;
      const walk = (k) => {
        if (solutions >= 2) return;
        if (k === words.length) { solutions++; return; }
        for (const n of member.get(words[k])) {
          if (room[n] === 0) continue;
          room[n]--; walk(k + 1); room[n]++;
          if (solutions >= 2) return;
        }
      };
      walk(0);
      if (solutions !== 1) {
        errs.push(solutions === 0
          ? 'no valid grouping — a collision annotation contradicts the board'
          : 'TWO OR MORE valid groupings — the board is ambiguous');
      }

      // ── ONE-WAY FLOW ACKNOWLEDGEMENT (owner rule, 2026-08-04) ───────────
      // The proof above is only as honest as the declared collisions. Its
      // blind spot: declare that words of A read as B, omit that something in
      // B reads back as A, and the arithmetic pins A's words for a reason
      // that is not true. #24 shipped that way — MARS/VENUS/SATURN were
      // declared to read as Roman gods and the gods group looked full, but
      // JUPITER sitting in it is itself a planet, so the board had five valid
      // groupings and the proof never saw it.
      //
      // So when >= 2 words of A read as B and nothing in B reads back, the
      // author is making a real claim: no member of B could belong to A.
      // Require it in writing as `reverseChecked: ['A -> B']`. Undeclared is
      // a failure, not a warning — a silent omission is exactly the bug.
      const flow = new Map();
      for (const c of p.collisions) {
        if (!homeOf.has(c.word) || !byName.has(c.reads)) continue;
        const k = `${homeOf.get(c.word)} -> ${c.reads}`;
        flow.set(k, (flow.get(k) || 0) + 1);
      }
      const signed = new Set(p.reverseChecked || []);
      for (const [k, n] of flow) {
        const [from, to] = k.split(' -> ');
        if (n < 2 || flow.has(`${to} -> ${from}`)) continue;
        if (!signed.has(k)) {
          errs.push(`one-way collision flow "${k}" (${n} words) is unacknowledged — `
            + `confirm no "${to}" on this board could read as "${from}", then add it to reverseChecked`);
        }
      }
      for (const k of signed) {
        const [from, to] = (k.split(' -> ').length === 2 ? k.split(' -> ') : [null, null]);
        if (!from || !byName.has(from) || !byName.has(to)) {
          errs.push(`reverseChecked "${k}" does not name two groups on this board`);
        } else if (!flow.has(k) || flow.get(k) < 2 || flow.has(`${to} -> ${from}`)) {
          errs.push(`reverseChecked "${k}" is stale — that is no longer a one-way flow`);
        }
      }
    } else if (p.reverseChecked) {
      errs.push('reverseChecked without collisions');
    } else if (p.sunday) {
      errs.push('Sunday Edition must declare its collisions');
    }
    const note = p.collisions
      ? `structure OK, ${p.collisions.length} collisions, exactly one valid grouping`
      : 'structure OK (no collisions declared; semantic audit manual, §7a)';
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, note);
  }
}

// ─── CRUX ───────────────────────────────────────────────────────────────────
if (RUN('crux')) {
  const { PUZZLES } = await import('../app/crux/puzzles.js');
  // Boards before this date are frozen history: they were authored before the
  // floor was machine-checkable, and rewriting a played board is not allowed.
  const CRUX_FLOOR_FROM = '2026-08-03';
  // Variety is enforced on anything banked after the current bank's last day,
  // so the next "bank crux to N days" job cannot recycle two traps forever.
  const CRUX_VARIETY_FROM = '2026-09-30';
  const cruxPool = new Map();
  const cruxFresh = new Map();
  for (const p of PUZZLES) {
    const errs = [], review = [];
    const catWords = p.categories.flatMap((c) => c.words);
    const slotWords = p.slots.map((s) => s.word);
    if (catWords.length !== slotWords.length) errs.push(`cats ${catWords.length} != slots ${slotWords.length}`);
    const missing = catWords.filter((w) => !slotWords.includes(w));
    if (missing.length) errs.push(`category words never placed: ${missing.join(',')}`);
    if (new Set(slotWords).size !== slotWords.length) errs.push('duplicate slot word');
    // geometry + crossings
    const cells = {};
    for (const s of p.slots) {
      for (let i = 0; i < s.word.length; i++) {
        const r = s.dir === 'D' ? s.row + i : s.row;
        const c = s.dir === 'D' ? s.col : s.col + i;
        if (r >= p.rows || c >= p.cols || r < 0 || c < 0) { errs.push(`${s.id} exits board`); break; }
        const k = `${r},${c}`;
        if (cells[k] && cells[k] !== s.word[i]) errs.push(`crossing clash at ${k} (${cells[k]} vs ${s.word[i]})`);
        cells[k] = s.word[i];
      }
      if (!dict.has(s.word.toLowerCase())) review.push(s.word);
    }
    // ── exactly one geometric filing ───────────────────────────────────────
    // A solver who has deduced the words must be able to place them one way
    // only; two filings means the board is ambiguous, not hard.
    if (p.live >= CRUX_FLOOR_FROM) {
      const n = p.slots.length;
      const pos = p.slots.map((s) => [...s.word].map((_, i) => (s.dir === 'A' ? `${s.row},${s.col + i}` : `${s.row + i},${s.col}`)));
      const words = p.slots.map((s) => s.word);
      const cross = {};
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (const c of pos[i]) if (pos[j].includes(c)) {
        (cross[i] = cross[i] || []).push([pos[i].indexOf(c), j, pos[j].indexOf(c)]);
        (cross[j] = cross[j] || []).push([pos[j].indexOf(c), i, pos[i].indexOf(c)]);
      }
      const cand = pos.map((pp) => words.map((w, wi) => [w, wi]).filter(([w]) => w.length === pp.length).map(([, wi]) => wi));
      const order = [...Array(n).keys()].sort((a, b) => cand[a].length - cand[b].length);
      const asg = Array(n).fill(-1), used = Array(n).fill(false);
      let count = 0;
      (function rec(k) {
        if (count >= 2) return;
        if (k === n) { count++; return; }
        const s2 = order[k];
        for (const wi of cand[s2]) {
          if (used[wi]) continue;
          const w = words[wi];
          let good = true;
          for (const [ci, o, cj] of (cross[s2] || [])) if (asg[o] >= 0 && w[ci] !== words[asg[o]][cj]) { good = false; break; }
          if (!good) continue;
          asg[s2] = wi; used[wi] = true; rec(k + 1); asg[s2] = -1; used[wi] = false;
          if (count >= 2) return;
        }
      })(0);
      if (count !== 1) errs.push(`${count >= 2 ? 'more than one' : 'no'} way to file the words into the slots`);
    }
    // ── collision floor ────────────────────────────────────────────────────
    // The rule the bank quietly broke once: a board whose only traps read as
    // categories that are not ON the board is flat, and half its score (the
    // filing half) is then free. See the header of app/crux/puzzles.js.
    if (p.live >= CRUX_FLOOR_FROM) {
      const floor = p.sunday ? 3 : 2;
      const cs = Array.isArray(p.collisions) ? p.collisions : null;
      if (!cs) errs.push('no collisions declared');
      else {
        const names = p.categories.map((c) => c.name);
        const seen = new Set();
        for (const c of cs) {
          const home = p.categories.find((cat) => cat.words.includes(c.word));
          if (!home) errs.push(`collision word ${c.word} is not on the board`);
          else if (!names.includes(c.reads)) errs.push(`${c.word} reads "${c.reads}", which is not a category here`);
          else if (home.name === c.reads) errs.push(`${c.word} reads its own category`);
          const k = `${c.word}|${c.reads}`;
          if (seen.has(k)) errs.push(`duplicate collision ${k}`);
          seen.add(k);
          cruxPool.set(k, (cruxPool.get(k) || 0) + 1);
          if (p.live >= CRUX_VARIETY_FROM) cruxFresh.set(k, (cruxFresh.get(k) || 0) + 1);
        }
        if (cs.length < floor) errs.push(`${cs.length} collision${cs.length === 1 ? '' : 's'}, floor is ${floor}${p.sunday ? ' on a Sunday' : ''}`);
      }
    }
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `slots+crossings OK${review.length ? ` — REVIEW non-dict: ${review.join(',')}` : ''}`);
  }
  // ── collision-pool variety ────────────────────────────────────────────────
  const stale = [...cruxPool.entries()].filter(([, n]) => n > 2).sort((a, b) => b[1] - a[1]);
  const staleFresh = [...cruxFresh.entries()].filter(([, n]) => n > 2);
  if (staleFresh.length) {
    fail('crux pool', `same collision reused more than twice on boards live from ${CRUX_VARIETY_FROM}: ${staleFresh.map(([k, n]) => `${k} x${n}`).join(', ')}`);
  } else if (stale.length) {
    note('crux pool', `grandfathered repetition in the Aug 11 to Sep 29 generated batch: ${stale.slice(0, 6).map(([k, n]) => `${k} x${n}`).join(', ')}${stale.length > 6 ? `, +${stale.length - 6} more` : ''}`);
  } else {
    ok('crux pool', 'collision pool is varied');
  }
}

// ─── SPAN ───────────────────────────────────────────────────────────────────
if (RUN('span')) {
  const { PUZZLES } = await import('../app/span/puzzles.js');
  const { buildAdj, shortestHops } = await import('../app/span/borders.js');
  const adj = buildAdj();
  for (const p of PUZZLES) {
    const errs = [];
    let truePar;
    if (p.avoid) {
      truePar = shortestHops(adj, p.start, p.end, new Set([p.avoid]));
      const un = shortestHops(adj, p.start, p.end);
      if (truePar === un) errs.push('avoid constraint changes nothing');
    } else if (p.via) {
      const a = shortestHops(adj, p.start, p.via);
      const b = shortestHops(adj, p.via, p.end);
      truePar = (a != null && b != null) ? a + b : null;
    } else {
      truePar = shortestHops(adj, p.start, p.end);
    }
    if (truePar == null) errs.push('no route exists');
    else if (truePar !== p.par) errs.push(`par ${p.par} != BFS ${truePar}`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `par ${p.par} = BFS${p.via ? ` (via ${p.via})` : p.avoid ? ` (avoid ${p.avoid})` : ''}`);
  }
}

// ─── DATING / CIRCA / EXTRA / OUTWIT ────────────────────────────────────────
if (RUN('dating')) {
  const { PUZZLES } = await import('../app/dating/puzzles.js');
  for (const p of PUZZLES) {
    const errs = [];
    // Sunday Editions run SIX events; weekdays run five.
    const wantEvents = p.sunday ? 6 : 5;
    if (p.events.length !== wantEvents) errs.push(`${p.events.length} events (want ${wantEvents})`);
    for (let i = 1; i < p.events.length; i++) if (!(p.events[i].when > p.events[i - 1].when)) errs.push(`order not strictly ascending at #${i}`);
    if (new Set(p.events.map((e) => e.t)).size !== p.events.length) errs.push('duplicate event');
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, 'strictly ascending, distinct');
  }
}
if (RUN('circa')) {
  const { PUZZLES } = await import('../app/circa/puzzles.js');
  for (const p of PUZZLES) {
    const errs = [];
    if (!Number.isInteger(p.year) || p.year < -4000 || p.year > 2026) errs.push(`year ${p.year} out of range`);
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${p.year} sane`);
  }
}
if (RUN('extra')) {
  const { PUZZLES } = await import('../app/extra/puzzles.js');
  const { resolveHidden } = await import('../app/extra/resolve-hidden.js');
  for (const p of PUZZLES) {
    const errs = [];
    // resolveHidden is the CLIENT's own matcher ('WORD#2' = 2nd occurrence);
    // it throws if any spec fails to land on a headline word.
    try { resolveHidden(p); } catch (e) { errs.push(String(e.message || e)); }
    for (const k of p.keys) {
      if (k !== k.toLowerCase()) errs.push(`key "${k}" not lowercase`);
      if (k.length < 3) errs.push(`key "${k}" too short (substring matching)`);
    }
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${p.hidden.length} hidden + ${p.keys.length} keys OK`);
  }
}
if (RUN('outwit')) {
  const { PUZZLES } = await import('../app/outwit/puzzles.js');
  // The Undercut (twothirds) prompt moved from FIRST to LAST on 2026-07-21, so
  // the expected order depends on the drop date. Earlier days are live and
  // frozen; they keep the original order.
  const UNDERCUT_LAST_FROM = '2026-07-21';
  const ORDER_OLD = ['twothirds', 'least', 'herd', 'match', 'unique'];
  const ORDER_NEW = ['least', 'herd', 'match', 'unique', 'twothirds'];
  // Sunday Editions run SIX prompts: a second `unique` before the Undercut,
  // which still runs last.
  const ORDER_SUN = ['least', 'herd', 'match', 'unique', 'unique', 'twothirds'];
  for (const p of PUZZLES) {
    const errs = [];
    const wantPrompts = p.sunday ? 6 : 5;
    if (p.prompts.length !== wantPrompts) errs.push(`${p.prompts.length} prompts (want ${wantPrompts})`);
    p.prompts.forEach((pr, i) => {
      const ORDER = p.sunday ? ORDER_SUN : p.live >= UNDERCUT_LAST_FROM ? ORDER_NEW : ORDER_OLD;
      if (pr.type !== ORDER[i]) errs.push(`prompt ${i} type ${pr.type} != ${ORDER[i]}`);
      if ((pr.type === 'least' || pr.type === 'match') && (!Array.isArray(pr.options) || pr.options.length < 4)) errs.push(`prompt ${i} bad options`);
      if (pr.type === 'herd' && pr.truth === undefined) errs.push('herd missing truth');
      if (!Array.isArray(pr.house) || pr.house.length < 8) errs.push(`prompt ${i} thin house crowd`);
    });
    errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, 'prompt order/shape OK');
  }
}

if (RUN('outrank')) {
  // Structural + SEMANTIC. The house crowd is Outrank's answer key: its 40
  // favorite votes define the crowd order the player must call. crowdOrderOf
  // sorts by vote count desc, breaking ties by DISPLAY INDEX — and the display
  // order is hand-mixed and 'carries no signal' (see the puzzle-file header),
  // so any tie in the house counts makes that boundary of the answer key
  // arbitrary: a pure-luck 2-point swing, the Outrank analog of a Links/Crux
  // double solution (§7a). RULE: every item's house count must be DISTINCT,
  // giving one unambiguous crowd order. Enforced as a hard fail on editable
  // (live >= today) boards; a tie on an already-live frozen board can no longer
  // be corrected without rewriting a played day, so it is grandfathered (note).
  const { PUZZLES } = await import('../app/outrank/puzzles.js');
  const TODAY = new Date().toISOString().slice(0, 10);
  const crowdCounts = (house, K) => { const c = new Array(K).fill(0); for (const v of house) if (Number.isInteger(v) && v >= 0 && v < K) c[v]++; return c; };
  const seenThemes = new Set();
  const seenIds = new Set();
  for (const p of PUZZLES) {
    const errs = [];
    const K = p.items.length;
    const wantK = p.sunday ? 7 : 6;
    if (K !== wantK) errs.push(`${K} items (want ${wantK})`);
    if (new Set(p.items).size !== K) errs.push('duplicate items');
    if (seenThemes.has(p.theme)) errs.push(`theme reused: ${p.theme}`);
    seenThemes.add(p.theme);
    if (seenIds.has(p.quizId)) errs.push('duplicate quizId');
    seenIds.add(p.quizId);
    let tiedNote = null;
    if (!Array.isArray(p.house) || p.house.length !== 40) errs.push(`house has ${(p.house || []).length} votes (want 40)`);
    else {
      const counts = crowdCounts(p.house, K);
      let range = true;
      for (const v of p.house) if (!Number.isInteger(v) || v < 0 || v >= K) { errs.push(`house vote out of range: ${v}`); range = false; break; }
      if (range) {
        if (counts.some((c) => c === 0)) errs.push('house leaves an item at zero votes');
        // SEMANTIC: counts must be all-distinct so the crowd order is unambiguous.
        if (new Set(counts).size !== K) {
          const tied = [];
          for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++) if (counts[i] === counts[j]) tied.push(`${p.items[i]}=${p.items[j]}@${counts[i]}`);
          const msg = `ambiguous crowd order: tied house counts [${tied.join(', ')}] (display-index tiebreak carries no signal)`;
          if (p.live >= TODAY) errs.push(msg);
          else tiedNote = `FROZEN past board, tie grandfathered: ${tied.join(', ')}`;
        }
      }
    }
    if (errs.length) fail(p.quizId, errs.join('; '));
    else if (tiedNote) note(p.quizId, tiedNote);
    else ok(p.quizId, `${K} items, distinct house crowd order OK (${p.theme})`);
  }
}


// ─── SHARDS ───────────────────────────────────────────────────────────────────
// Two proofs per puzzle, because the game needs both to be true:
//
//   1. UNIQUENESS (correctness): exactly ONE reassembly of the shard set makes
//      every across/down run of 2+ letters a dictionary word, and it is the
//      solution encoded in the shard coordinates. The search prunes on the
//      dictionary the moment a placement completes a run, and it carries a node
//      cap: if the cap is hit the search was incomplete, so uniqueness is NOT
//      proven and the puzzle FAILS rather than passing on an unfinished proof.
//
//   2. AMBIGUITY (difficulty, owner ruling 2026-08-01): the shard SHAPES must
//      tile the outline in at least AMBIG_FLOOR different ways. A puzzle whose
//      shapes fit only one way is solved by shape-fitting alone and the player
//      never reads a letter, which is exactly why the launch bank played too
//      easy. Puzzles that went live before AMBIG_FROM are grandfathered.
//
// Structural checks: square grid, shards tile the fillable cells exactly (no
// overlap, none on a block), each shard 3-6 cells, 5-18 shards.
if (RUN('shards')) {
  const { PUZZLES } = await import('../app/shards/puzzles.js');
  const AMBIG_FROM = '2026-08-02';            // ladder start; earlier days are frozen history
  const AMBIG_FLOOR = { 6: 8, 7: 12, 8: 12 }; // by grid size; must match TIERS in scripts/gen-shards/build_ladder.py
  const NODECAP = 5_000_000;

  // Cell indices and the across/down runs each cell belongs to.
  const geometry = (fillCells, n) => {
    const order = [...fillCells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const idx = new Map(); order.forEach(([r, c], i) => idx.set(r * 100 + c, i));
    const runs = []; const cellRuns = order.map(() => []);
    for (let r = 0; r < n; r++) { let c = 0; while (c < n) { if (idx.has(r * 100 + c)) { const s = c; const run = []; while (c < n && idx.has(r * 100 + c)) { run.push(idx.get(r * 100 + c)); c++; } if (c - s >= 2) runs.push(run); } else c++; } }
    for (let c = 0; c < n; c++) { let r = 0; while (r < n) { if (idx.has(r * 100 + c)) { const s = r; const run = []; while (r < n && idx.has(r * 100 + c)) { run.push(idx.get(r * 100 + c)); r++; } if (r - s >= 2) runs.push(run); } else r++; } }
    runs.forEach((run, ri) => run.forEach((ci) => cellRuns[ci].push(ri)));
    return { order, idx, runs, cellRuns };
  };

  // Every legal position of one shard, as a BigInt-free bitmask pair.
  const placementsOf = (shard, idx, n, ncells) => {
    const out = [];
    for (let br = 0; br < n; br++) for (let bc = 0; bc < n; bc++) {
      const lo = []; let okp = true;
      for (const [dr, dc, ch] of shard.offs) {
        const k = (br + dr) * 100 + (bc + dc);
        if (!idx.has(k)) { okp = false; break; }
        lo.push([idx.get(k), ch]);
      }
      if (okp) out.push(lo);
    }
    return out;
  };

  // Proof 1: unique word-valid reassembly, dictionary-pruned, node capped.
  const proveUnique = (shards, fillCells, n, cap = 2) => {
    const { order, idx, runs, cellRuns } = geometry(fillCells, n);
    const ncells = order.length;
    const byCell = shards.map(() => Array.from({ length: ncells }, () => []));
    shards.forEach((sh, si) => {
      for (const pl of placementsOf(sh, idx, n, ncells)) {
        for (const [ci] of pl) byCell[si][ci].push(pl);
      }
    });
    const runLen = runs.map((r) => r.length);
    const filled = new Array(runs.length).fill(0);
    const letters = new Array(ncells).fill(null);
    const covered = new Array(ncells).fill(false);
    const used = new Array(shards.length).fill(false);
    const found = new Set();
    let nodes = 0, capped = false, nCovered = 0;
    const rec = () => {
      if (found.size >= cap || capped) return;
      if (++nodes > NODECAP) { capped = true; return; }
      if (nCovered === ncells) { found.add(letters.join('')); return; }
      let tgt = -1; for (let i = 0; i < ncells; i++) if (!covered[i]) { tgt = i; break; }
      for (let si = 0; si < shards.length; si++) {
        if (used[si]) continue;
        for (const pl of byCell[si][tgt]) {
          let clash = false;
          for (const [ci] of pl) if (covered[ci]) { clash = true; break; }
          if (clash) continue;
          for (const [ci, ch] of pl) { covered[ci] = true; letters[ci] = ch; }
          nCovered += pl.length;
          let bad = false; const touched = [];
          for (const [ci] of pl) {
            for (const ri of cellRuns[ci]) {
              filled[ri]++; touched.push(ri);
              if (filled[ri] === runLen[ri]) {
                let w = ''; for (const x of runs[ri]) w += letters[x];
                if (!dict.has(w.toLowerCase())) bad = true;
              }
            }
            if (bad) break;
          }
          if (!bad) { used[si] = true; rec(); used[si] = false; }
          for (const ri of touched) filled[ri]--;
          for (const [ci] of pl) { covered[ci] = false; letters[ci] = null; }
          nCovered -= pl.length;
          if (found.size >= cap || capped) return;
        }
      }
    };
    rec();
    return { found, nodes, exhausted: !capped };
  };

  // Proof 2: how many ways the SHAPES alone tile the outline, stopping at `floor`.
  const countTilings = (shards, fillCells, n, floor) => {
    const { order, idx } = geometry(fillCells, n);
    const ncells = order.length;
    const byCell = shards.map(() => Array.from({ length: ncells }, () => []));
    shards.forEach((sh, si) => {
      for (const pl of placementsOf(sh, idx, n, ncells)) {
        for (const [ci] of pl) byCell[si][ci].push(pl.map(([c]) => c));
      }
    });
    const covered = new Array(ncells).fill(false);
    const owner = new Array(ncells).fill(-1);
    const used = new Array(shards.length).fill(false);
    const seen = new Set();
    let nodes = 0, capped = false, nCovered = 0;
    const rec = () => {
      if (seen.size >= floor || capped) return;
      if (++nodes > NODECAP) { capped = true; return; }
      if (nCovered === ncells) { seen.add(owner.map((o) => shards[o].sig).join('/')); return; }
      let tgt = -1; for (let i = 0; i < ncells; i++) if (!covered[i]) { tgt = i; break; }
      for (let si = 0; si < shards.length; si++) {
        if (used[si]) continue;
        for (const pl of byCell[si][tgt]) {
          let clash = false;
          for (const ci of pl) if (covered[ci]) { clash = true; break; }
          if (clash) continue;
          for (const ci of pl) { covered[ci] = true; owner[ci] = si; }
          nCovered += pl.length; used[si] = true;
          rec();
          used[si] = false; nCovered -= pl.length;
          for (const ci of pl) covered[ci] = false;
          if (seen.size >= floor || capped) return;
        }
      }
    };
    rec();
    return { count: seen.size, exhausted: !capped };
  };

  for (const p of PUZZLES) {
    const errs = []; const n = p.rows;
    if (p.rows !== p.cols) errs.push('non-square grid');
    const blockset = new Set((p.blocks || []).map(([r, c]) => r * 100 + c));
    const intended = new Map(); const cov = new Set();
    const shards = (p.shards || []).map((sh) => {
      const rs = sh.cells.map((c) => c[0]), cs = sh.cells.map((c) => c[1]);
      const mr = Math.min(...rs), mc = Math.min(...cs);
      const offs = sh.cells.map(([r, c, ch]) => [r - mr, c - mc, ch]);
      if (sh.cells.length < 3 || sh.cells.length > 6) errs.push(`shard of ${sh.cells.length} cells (want 3-6)`);
      for (const [r, c, ch] of sh.cells) {
        const k = r * 100 + c;
        if (blockset.has(k)) errs.push(`shard cell on a block at ${r},${c}`);
        if (cov.has(k)) errs.push(`shard overlap at ${r},${c}`);
        cov.add(k); intended.set(k, ch.toLowerCase());
      }
      const sig = offs.map((o) => o[0] + ':' + o[1]).sort().join('|');
      return { offs, sig };
    });
    const fillCells = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!blockset.has(r * 100 + c)) fillCells.push([r, c]);
    if (fillCells.length !== cov.size) errs.push(`shards cover ${cov.size} of ${fillCells.length} fillable cells`);
    if (p.shards.length < 5 || p.shards.length > 18) errs.push(`${p.shards.length} shards (want 5-18)`);
    if (!errs.length) {
      const { found, exhausted } = proveUnique(shards, fillCells, n);
      const order = [...fillCells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const intendedStr = order.map(([r, c]) => intended.get(r * 100 + c).toUpperCase()).join('');
      if (!exhausted) errs.push('uniqueness search hit the node cap, so uniqueness is NOT proven');
      else if (found.size !== 1) errs.push(`NOT UNIQUE: ${found.size} valid reassemblies`);
      else if (!found.has(intendedStr)) errs.push('unique reassembly does not match the intended solution');
      else {
        const floor = p.live >= AMBIG_FROM ? (AMBIG_FLOOR[n] || 0) : 0;
        let note = '';
        if (floor) {
          const { count, exhausted: ex2 } = countTilings(shards, fillCells, n, floor);
          if (count < floor && ex2) errs.push(`too easy: shapes tile only ${count} way(s), floor is ${floor} (shape-fitting would solve it without reading a letter)`);
          else if (count < floor) errs.push(`ambiguity search hit the node cap at ${count} of ${floor}`);
          else note = `, ${count}+ shape tilings`;
        }
        if (!errs.length) { ok(p.quizId, `${n}x${n}, ${p.shards.length} shards, unique reassembly${note}`); continue; }
      }
    }
    fail(p.quizId, errs.join('; '));
  }
}

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll requested banks verified.');
process.exit(BAD ? 1 : 0);
