#!/usr/bin/env node
// scripts/verify-slot.mjs — the gate for app/slot/puzzles.js.
//
//   node scripts/verify-slot.mjs            # the whole bank, par and range re-proved
//   node scripts/verify-slot.mjs --quick    # everything except the range re-proof (~1s)
//
// Re-derives rather than trusts. For every board: the items are byte for
// byte the pool subject's leading ten (twelve on a Sunday) in the pool's
// order; every value is strictly monotonic in `dir` with no ties, and on a
// measured subject neighbours sit at least 1.5% apart (an `exact` subject,
// years and ages and a scale, needs only no ties); `reveal` is a permutation;
// the stored `parMean` is the sensible player's mean recomputed from the
// same seed and `par` its rounding; the board's par sits where the weekday
// band says it should in the subject's own [hardest, easiest] range, which
// is recomputed in full unless --quick; the calendar is consecutive from
// board 1 with quizIds in the slot-M-D-YY shape and `sunday` on real
// Sundays only. Across the bank: no subject twice, no family two days
// running, no em dash or British spelling in reader-facing strings.
//
// Confirmed to FAIL on: a swapped pair of values, a duplicated reveal index,
// a par off by one, a Sunday flagged on a Saturday, and a subject used twice.

import { PUZZLES } from '../app/slot/puzzles.js';
import { POOL } from './slot-pool.mjs';
import { parOf, orderRange } from './slot-sim.mjs';

const QUICK = process.argv.includes('--quick');
const BAND = { 1: 0.85, 2: 0.70, 3: 0.55, 4: 0.40, 5: 0.28, 6: 0.15, 0: 0.30 };
const TOL = 0.14;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const BRITISH = /\b(colour|metres?|centre|defence|licence|grey|aluminium|kilometre|theatre|catalogue)\b/i;

const fails = [], warns = [];
const fail = (m) => fails.push(m);
const warn = (m) => warns.push(m);

// ─── the pool ────────────────────────────────────────────────────────────
const byId = new Map();
for (const s of POOL) {
  if (byId.has(s.id)) fail(`pool: duplicate subject id ${s.id}`);
  byId.set(s.id, s);
  if (!Array.isArray(s.items) || s.items.length < 10) fail(`pool ${s.id}: fewer than ten items`);
  if (!['asc', 'desc'].includes(s.dir)) fail(`pool ${s.id}: dir must be asc or desc`);
  if (!s.axis || !s.top || !s.bottom || !s.unit || !s.fam || !s.source) fail(`pool ${s.id}: missing a reader-facing field`);
  for (const str of [s.axis, s.top, s.bottom, s.unit, s.source]) {
    if (/—/.test(str)) fail(`pool ${s.id}: em dash in "${str}"`);
    if (BRITISH.test(str)) fail(`pool ${s.id}: British spelling in "${str}"`);
  }
  const names = new Set();
  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    if (!Array.isArray(it) || it.length !== 3 || typeof it[0] !== 'string' || typeof it[1] !== 'number' || typeof it[2] !== 'string') { fail(`pool ${s.id}: item ${i} is not [name, value, display]`); continue; }
    if (names.has(it[0])) fail(`pool ${s.id}: duplicate item ${it[0]}`);
    names.add(it[0]);
    if (/—/.test(it[0]) || /—/.test(it[2])) fail(`pool ${s.id}: em dash in item ${it[0]}`);
    if (new RegExp('\\b' + it[0].toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(s.axis.toLowerCase())) fail(`pool ${s.id}: the axis names an answer (${it[0]})`);
    if (i === 0) continue;
    const a = s.items[i - 1][1], b = it[1];
    const ok = s.dir === 'desc' ? a > b : a < b;
    if (!ok) fail(`pool ${s.id}: ${s.items[i - 1][0]} (${a}) and ${it[0]} (${b}) are not in ${s.dir} order, or tie`);
    else if (!s.exact) {
      const gap = Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b));
      if (gap < 0.015) fail(`pool ${s.id}: ${s.items[i - 1][0]} and ${it[0]} are only ${(gap * 100).toFixed(2)}% apart`);
    }
  }
}

// ─── the bank ────────────────────────────────────────────────────────────
function addDays(iso, n) { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function dow(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
function label(iso) { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; }
function qid(iso) { const [y, m, d] = iso.split('-').map(Number); return `slot-${m}-${d}-${String(y).slice(2)}`; }

if (!PUZZLES.length) fail('bank: empty');
const first = PUZZLES[0] && PUZZLES[0].live;
const usedSubject = new Map();
let prevFam = null;
const rangeCache = new Map();
for (let i = 0; i < PUZZLES.length; i++) {
  const p = PUZZLES[i];
  const tag = `board ${p.num} (${p.live})`;
  if (p.num !== i + 1) fail(`${tag}: num should be ${i + 1}`);
  if (p.live !== addDays(first, i)) fail(`${tag}: live should be ${addDays(first, i)}`);
  if (p.quizId !== qid(p.live)) fail(`${tag}: quizId should be ${qid(p.live)}`);
  if (p.dateLabel !== label(p.live)) fail(`${tag}: dateLabel should be ${label(p.live)}`);
  const sun = dow(p.live) === 0;
  if (!!p.sunday !== sun) fail(`${tag}: sunday flag ${!!p.sunday} on a ${sun ? 'Sunday' : 'weekday'}`);
  const n = sun ? 12 : 10;
  const s = byId.get(p.subject);
  if (!s) { fail(`${tag}: unknown subject ${p.subject}`); continue; }
  if (usedSubject.has(p.subject)) fail(`${tag}: subject ${p.subject} already used on board ${usedSubject.get(p.subject)}`);
  usedSubject.set(p.subject, p.num);
  if (s.fam === prevFam) fail(`${tag}: family ${s.fam} two days running`);
  prevFam = s.fam;
  if (!Array.isArray(p.items) || p.items.length !== n) fail(`${tag}: ${p.items && p.items.length} items, need ${n}`);
  else if (JSON.stringify(p.items) !== JSON.stringify(s.items.slice(0, n))) fail(`${tag}: items differ from the pool's leading ${n}`);
  for (const k of ['axis', 'top', 'bottom', 'unit', 'dir', 'source']) if (p[k] !== s[k]) fail(`${tag}: ${k} differs from the pool`);
  const rv = Array.isArray(p.reveal) ? p.reveal.slice().sort((a, b) => a - b) : null;
  if (!rv || rv.length !== n || rv.some((x, j) => x !== j)) { fail(`${tag}: reveal is not a permutation of 0..${n - 1}`); continue; }
  const mean = parOf(p.subject, p.reveal);
  if (Math.abs(mean - p.parMean) > 0.006) fail(`${tag}: parMean ${p.parMean} recomputes to ${mean.toFixed(3)}`);
  if (p.par !== Math.round(p.parMean)) fail(`${tag}: par ${p.par} is not the rounding of ${p.parMean}`);
  if (!Array.isArray(p.range) || p.range.length !== 2 || !(p.range[0] < p.range[1])) fail(`${tag}: range must be [hardest, easiest]`);
  else {
    if (p.parMean < p.range[0] - 0.01 || p.parMean > p.range[1] + 0.01) fail(`${tag}: parMean outside its own range`);
    const frac = (p.parMean - p.range[0]) / (p.range[1] - p.range[0]);
    if (Math.abs(frac - BAND[dow(p.live)]) > TOL) fail(`${tag}: par sits at ${frac.toFixed(2)} of the range, the ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow(p.live)]} band is ${BAND[dow(p.live)]}`);
    if (!QUICK) {
      const key = p.subject + '|' + n;
      if (!rangeCache.has(key)) rangeCache.set(key, orderRange(p.subject, n));
      const rg = rangeCache.get(key);
      if (Math.abs(rg.lo - p.range[0]) > 0.006 || Math.abs(rg.hi - p.range[1]) > 0.006) fail(`${tag}: range [${p.range}] recomputes to [${rg.lo.toFixed(2)}, ${rg.hi.toFixed(2)}]`);
    }
  }
}

// Runway.
if (PUZZLES.length) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const last = PUZZLES[PUZZLES.length - 1].live;
  const daysLeft = Math.round((new Date(last + 'T12:00:00Z') - new Date(today + 'T12:00:00Z')) / 86400000);
  if (daysLeft < 0) fail(`bank ended ${last}, ${-daysLeft} days ago`);
  else if (daysLeft < 14) warn(`bank runs out ${last}, ${daysLeft} days from today`);
}

for (const w of warns) console.warn('WARN ' + w);
if (fails.length) {
  for (const f of fails) console.error('FAIL ' + f);
  console.error(`verify-slot: ${fails.length} failure${fails.length === 1 ? '' : 's'}`);
  process.exit(1);
}
console.log(`verify-slot: ${PUZZLES.length} boards, ${POOL.length} subjects, clean${QUICK ? ' (quick: range not re-proved)' : ''}`);
