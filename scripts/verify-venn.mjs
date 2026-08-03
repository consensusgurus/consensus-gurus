// Verify the Venn bank (app/venn/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, 12 items on weekdays and 15 on Sundays, items
//     distinct and plain uppercase, three rule specs and all three different
//   - every one of the SEVEN regions is non-empty, so the diagram is fully used
//   - the triple overlap holds 1 or 2 items, never a dump
//   - no region holds more than 3 (weekday) or 4 (Sunday)
//   - no item falls outside all three circles
//   - hidden counts appear only on Sundays, exactly two of them, never the
//     triple overlap
// The board carries no answer: an item's region is recomputed here from the
// rules, exactly as the client recomputes it.
// Run: node scripts/verify-venn.mjs
import { PUZZLES } from '../app/venn/puzzles.js';

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails++; };

const VOW = new Set(['A','E','I','O','U']);
const nv = (w) => [...w].filter((c) => VOW.has(c)).length;
const HIDDEN = {
  animal: ['CAT','DOG','COW','OWL','BAT','APE','RAT','PIG','HEN','FOX','ANT','BEE','ELK','EWE','SOW','RAM'],
  body: ['EAR','RIB','HIP','ARM','LIP','GUM','JAW','TOE','EYE','LEG','SHIN','HEEL','CHIN','LUNG','SKIN','NECK','BONE','HAND','FOOT','KNEE','HAIR','HEAD','FACE','NOSE','BACK','PALM','NAIL','CHEST','THIGH','SPINE','WRIST','ANKLE','ELBOW','CHEEK','THUMB','TOOTH','BRAIN','HEART'],
  number: ['ONE','TWO','SIX','TEN','NINE','FOUR','FIVE'],
};
// kept byte-identical to RULES in app/venn/VennClient.jsx
function ruleFn(r) {
  switch (r.k) {
    case 'alpha': return (w) => [...w].every((c,i) => i === 0 || c >= w[i-1]);
    case 'norepeat': return (w) => new Set(w).size === w.length;
    case 'dbl': return (w) => /(.)\1/.test(w);
    case 'len': return (w) => w.length === r.n;
    case 'lenGte': return (w) => w.length >= r.n;
    case 'vowels': return (w) => nv(w) === r.n;
    case 'onevowel': return (w) => new Set([...w].filter((c) => VOW.has(c))).size === 1;
    case 'sameends': return (w) => w[0] === w[w.length-1];
    case 'startvowel': return (w) => VOW.has(w[0]);
    case 'endvowel': return (w) => VOW.has(w[w.length-1]);
    case 'altvc': return (w) => [...w].every((c,i) => i === 0 || VOW.has(c) !== VOW.has(w[i-1]));
    case 'twinvowel': return (w) => [...w].some((c,i) => i > 0 && VOW.has(c) && VOW.has(w[i-1]));
    case 'nolet': return (w) => !w.includes(r.c);
    // A word only HIDES something when the smaller word sits inside a
    // LONGER one. LUNG does not hide a lung and EYES does not hide an eye:
    // an item that IS the hidden word, or merely its plural, hides nothing.
    // HEART still qualifies, because a heart hides an EAR.
    case 'hides': return (w) => HIDDEN[r.set].some((h) => w.includes(h) && w !== h && w !== h + 'S' && w !== h + 'ES');
    default: return null;
  }
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const REGIONS = [1,2,4,3,5,6,7];
const seen = new Set();

PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  if (seen.has(p.quizId)) fail(`${tag}: duplicate quizId`);
  seen.add(p.quizId);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `venn-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live date`);
  if (p.dateLabel !== `${MONTHS[m-1]} ${d}, ${y}`) fail(`${tag}: dateLabel does not match live date`);
  if (!!p.sunday !== (new Date(Date.UTC(y, m-1, d)).getUTCDay() === 0)) fail(`${tag}: sunday flag wrong`);

  if (p.rules.length !== 3) { fail(`${tag}: ${p.rules.length} rules (want 3)`); return; }
  const fns = p.rules.map(ruleFn);
  if (fns.some((f) => !f)) { fail(`${tag}: unknown rule spec`); return; }
  if (new Set(p.rules.map((r) => JSON.stringify(r))).size !== 3) fail(`${tag}: two circles carry the same rule`);

  const want = p.sunday ? 15 : 12;
  if (p.items.length !== want) fail(`${tag}: ${p.items.length} items (want ${want})`);
  if (new Set(p.items).size !== p.items.length) fail(`${tag}: duplicate item`);
  if (p.items.some((w) => !/^[A-Z]{3,9}$/.test(w))) fail(`${tag}: an item is not plain uppercase letters`);

  const region = (w) => (fns[0](w) ? 1 : 0) | (fns[1](w) ? 2 : 0) | (fns[2](w) ? 4 : 0);
  const counts = {}; REGIONS.forEach((r) => { counts[r] = 0; });
  p.items.forEach((w) => {
    const r = region(w);
    if (r === 0) fail(`${tag}: ${w} sits outside all three circles`);
    else counts[r]++;
  });
  REGIONS.forEach((r) => { if (!counts[r]) fail(`${tag}: region ${r} is empty`); });
  // No item may LOOK like it hides a word without qualifying. An item that
  // is the hidden word itself, or just its plural, reads to a solver as a
  // member of that circle while scoring outside it, which is unfair.
  const hr = p.rules.find((r) => r.k === 'hides');
  if (hr) {
    p.items.forEach((w) => {
      const hits = HIDDEN[hr.set].filter((h) => w.includes(h));
      if (hits.length && !hits.some((h) => w !== h && w !== h + 'S' && w !== h + 'ES')) {
        fail(`${tag}: ${w} reads as hiding ${hits.join('/')} but only IS that word`);
      }
    });
  }

  if (counts[7] < 1 || counts[7] > 2) fail(`${tag}: triple overlap holds ${counts[7]} (want 1 or 2)`);
  const cap = p.sunday ? 4 : 3;
  REGIONS.forEach((r) => { if (counts[r] > cap) fail(`${tag}: region ${r} holds ${counts[r]} (cap ${cap})`); });

  const hid = p.hiddenCounts || [];
  if (!p.sunday && hid.length) fail(`${tag}: weekday board hides counts`);
  if (p.sunday && hid.length !== 2) fail(`${tag}: Sunday hides ${hid.length} counts (want 2)`);
  if (hid.includes(7)) fail(`${tag}: the triple overlap count must never be hidden`);
  if (hid.some((r) => !REGIONS.includes(r))) fail(`${tag}: hidden count names a region that does not exist`);
});

if (fails) { console.error(`\nverify-venn: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-venn: all ${PUZZLES.length} boards pass (regions all used, overlap sane, membership recomputed)`);
