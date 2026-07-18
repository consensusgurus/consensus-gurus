// Verify the Daily Alibi bank: every puzzle's clues must admit EXACTLY ONE
// (room, time, obj) assignment, the stored solution must be that assignment,
// clue counts must sit in the 8-11 difficulty band, all indices in range, and
// ids/dates/sunday flags consistent. Run after ANY edit:
//   node scripts/verify-alibi.mjs
import { PUZZLES } from '../app/alibi/puzzles.js';

const PERMS4 = (() => {
  const out = [];
  const permute = (a, l) => {
    if (l === a.length) { out.push(a.slice()); return; }
    for (let i = l; i < a.length; i++) { [a[l], a[i]] = [a[i], a[l]]; permute(a, l + 1); [a[l], a[i]] = [a[i], a[l]]; }
  };
  permute([0, 1, 2, 3], 0);
  return out;
})();

function evalClue(c, room, time, obj) {
  switch (c.type) {
    case 'notRoom': return room[c.s] !== c.r;
    case 'notObj': return obj[c.s] !== c.o;
    case 'roomObj': { const s = room.indexOf(c.r); return obj[s] === c.o; }
    case 'roomTime': { const s = room.indexOf(c.r); return time[s] === c.t; }
    case 'before': return time[c.s1] < time[c.s2];
    case 'beforeRoom': { const s2 = room.indexOf(c.r); return c.s !== s2 && time[c.s] < time[s2]; }
    case 'hasObj': return obj[c.s] === c.o;
  }
  return false;
}

function solutions(clues, cap = 3) {
  const sols = [];
  for (const room of PERMS4) for (const time of PERMS4) for (const obj of PERMS4) {
    let ok = true;
    for (const c of clues) { if (!evalClue(c, room, time, obj)) { ok = false; break; } }
    if (ok) { sols.push({ room, time, obj }); if (sols.length >= cap) return sols; }
  }
  return sols;
}

// ─── NO-GUESSING CHECK: every case must fall to pure propagation ─────────
// (human-standard moves only: eliminations, room↔object/time links, before-
// chain bounds, permutation singles/pairs). Unique-but-guessy cases fail.
const FULL = [0, 1, 2, 3];
function clone(d) { return { room: d.room.map(s => new Set(s)), time: d.time.map(s => new Set(s)), obj: d.obj.map(s => new Set(s)) }; }
function fresh() { return { room: FULL.map(() => new Set(FULL)), time: FULL.map(() => new Set(FULL)), obj: FULL.map(() => new Set(FULL)) }; }
const solvedCat = (c) => c.every(s => s.size === 1);
const solvedAll = (d) => solvedCat(d.room) && solvedCat(d.time) && solvedCat(d.obj);
const broken = (d) => ['room', 'time', 'obj'].some(k => d[k].some(s => s.size === 0));

function propagate(d, clues) {
  let changed = true;
  while (changed) {
    changed = false;
    const rm = (cat, s, v) => { if (d[cat][s].has(v)) { d[cat][s].delete(v); changed = true; } };
    const fix = (cat, s, v) => { for (const x of [...d[cat][s]]) if (x !== v) rm(cat, s, x); };
    // permutation: naked singles + hidden singles + naked pairs
    for (const cat of ['room', 'time', 'obj']) {
      for (let s = 0; s < 4; s++) {
        if (d[cat][s].size === 1) {
          const v = [...d[cat][s]][0];
          for (let s2 = 0; s2 < 4; s2++) if (s2 !== s) rm(cat, s2, v);
        }
      }
      for (const v of FULL) {
        const cands = FULL.filter(s => d[cat][s].has(v));
        if (cands.length === 1 && d[cat][cands[0]].size > 1) fix(cat, cands[0], v);
      }
      // naked pairs: two suspects sharing the same 2-value domain lock those values
      for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
        if (d[cat][a].size === 2 && d[cat][b].size === 2) {
          const av = [...d[cat][a]].sort().join(''), bv = [...d[cat][b]].sort().join('');
          if (av === bv) {
            for (let s2 = 0; s2 < 4; s2++) if (s2 !== a && s2 !== b) for (const v of [...d[cat][a]]) rm(cat, s2, v);
          }
        }
      }
    }
    for (const c of clues) {
      switch (c.type) {
        case 'notRoom': rm('room', c.s, c.r); break;
        case 'notObj': rm('obj', c.s, c.o); break;
        case 'hasObj': fix('obj', c.s, c.o); break;
        case 'roomObj':
          for (let s = 0; s < 4; s++) {
            if (!d.room[s].has(c.r)) continue;
            if (d.room[s].size === 1) fix('obj', s, c.o);
            else if (!d.obj[s].has(c.o)) rm('room', s, c.r);
          }
          for (let s = 0; s < 4; s++) {
            if (d.obj[s].size === 1 && d.obj[s].has(c.o)) fix('room', s, c.r);
            if (!d.obj[s].has(c.o) && d.room[s].size === 1 && d.room[s].has(c.r)) { /* contradiction caught by size-0 later */ rm('obj', s, ...[]); }
          }
          break;
        case 'roomTime':
          for (let s = 0; s < 4; s++) {
            if (!d.room[s].has(c.r)) continue;
            if (d.room[s].size === 1) fix('time', s, c.t);
            else if (!d.time[s].has(c.t)) rm('room', s, c.r);
          }
          for (let s = 0; s < 4; s++) {
            if (d.time[s].size === 1 && d.time[s].has(c.t)) fix('room', s, c.r);
          }
          break;
        case 'before': {
          const max2 = Math.max(...d.time[c.s2]);
          for (const v of [...d.time[c.s1]]) if (v >= max2) rm('time', c.s1, v);
          const min1 = Math.min(...d.time[c.s1]);
          for (const v of [...d.time[c.s2]]) if (v <= min1) rm('time', c.s2, v);
          break;
        }
        case 'beforeRoom': {
          rm('room', c.s, c.r);
          const cands = FULL.filter(s2 => s2 !== c.s && d.room[s2].has(c.r));
          if (cands.length === 1) {
            const s2 = cands[0];
            const max2 = Math.max(...d.time[s2]);
            for (const v of [...d.time[c.s]]) if (v >= max2) rm('time', c.s, v);
            const min1 = Math.min(...d.time[c.s]);
            for (const v of [...d.time[s2]]) if (v <= min1) rm('time', s2, v);
          } else if (cands.length > 1) {
            const maxAny = Math.max(...cands.map(s2 => Math.max(...d.time[s2])));
            for (const v of [...d.time[c.s]]) if (v >= maxAny) rm('time', c.s, v);
          }
          // any candidate occupant who could not have left AFTER s cannot be in room r
          for (const s2 of cands) {
            if (Math.max(...d.time[s2]) <= Math.min(...d.time[c.s])) rm('room', s2, c.r);
          }
          break;
        }
      }
    }
  }
  return d;
}


let bad = 0;
PUZZLES.forEach((p, i) => {
  const errs = [];
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^alibi-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    // no Sunday editions yet: the flag must be false so /daily never
    // shows a phantom "Sunday Edition" chip (isSundayEdition reads it).
    if (p.sunday !== false) errs.push('sunday must be false (no Sunday editions)');
  }
  for (const arr of [p.suspects, p.rooms, p.objects, p.times]) {
    if (!Array.isArray(arr) || arr.length !== 4 || new Set(arr).size !== 4) errs.push('bad category arrays');
  }
  if (p.clues.length < 8 || p.clues.length > 11) errs.push(`clue count ${p.clues.length} outside 8-11`);
  for (const c of p.clues) {
    for (const k of ['s', 's1', 's2', 'r', 'o', 't']) {
      if (c[k] !== undefined && (c[k] < 0 || c[k] > 3)) errs.push('index out of range');
    }
  }
  const sols = solutions(p.clues);
  const dom = propagate(fresh(), p.clues);
  if (!solvedAll(dom)) errs.push('NOT pure-deduction solvable (needs guessing)');
  if (sols.length !== 1) errs.push(`solutions=${sols.length}, need exactly 1`);
  else {
    const s = sols[0];
    for (const k of ['room', 'time', 'obj']) {
      if (JSON.stringify(s[k]) !== JSON.stringify(p.solution[k])) errs.push(`stored solution.${k} mismatch`);
    }
    // no clue may be redundant-free? (informational only) — but every clue must be TRUE of the solution
    for (const c of p.clues) {
      if (!evalClue(c, s.room, s.time, s.obj)) errs.push('clue false of solution');
    }
  }
  if (errs.length) { bad++; console.error(`✗ ${p.quizId}: ${errs.join('; ')}`); }
  else console.log(`✓ ${p.quizId}  ${p.clues.length} clues, unique solution, stored solution matches`);
});
if (bad) { console.error(`\n${bad} bad puzzle(s)`); process.exit(1); }
console.log(`\nAll ${PUZZLES.length} Alibi puzzles verified.`);
