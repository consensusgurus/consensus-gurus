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
