// Verify the Listed (daily "rank these eight things by one number" puzzle)
// bank. Listed's own header comment (app/listed/puzzles.js) and its client's
// rules copy (ListedClient.jsx) promise, per puzzle:
//   - `items` stored in TRUE ORDER (index 0 = rank 1, the item `hi` names);
//   - `cat` is either "History" or "Geography", and "the two rotate through
//     the week" (owner ruling 2026-07-27: the running order ALTERNATES so
//     the domain rotates, not "runs mostly History with occasional
//     Geography");
//   - the answer key is a published NUMBER, never an opinion, so there is
//     always exactly one right order and no two items may tie;
//   - Sunday Editions carry a ninth item.
// None of that was previously machine-checked. This script recomputes it:
//
//   1. Structural: items.length is 8 (weekday) or 9 (Sunday); cat is exactly
//      "History" or "Geography"; every item has non-empty t/v/d; title,
//      metric, hi, lo, source are all present.
//   2. The displayed order is actually consistent with the displayed values:
//      each item's `v` string is parsed into a comparable magnitude (handles
//      $/M/B/million/billion suffixes, sq km/sq mi/m/km units, plain counts
//      with commas, "yr, d" ages, "Mon YYYY" dates, "c." / BC / AD years, and
//      latitude "N" strings) and the 8/9 values must be STRICTLY monotonic
//      in one consistent direction with no ties -- a reversal or a tie is
//      exactly the "two items swapped" or "two items tie" bug class this
//      exists to catch. This checks internal self-consistency of the shipped
//      data (order vs. displayed figure), not the real-world fact itself,
//      which needs a live source and is out of scope for an offline script.
//   3. Domain alternation (the pool-variety rule the bank is documented to
//      violate): no run of 3+ same-`cat` boards, and the History/Geography
//      split stays roughly even, for every board live on or after
//      LISTED_FLOOR_FROM. Boards before that date are frozen history
//      (already played) and are grandfathered as a note, mirroring
//      CRUX_FLOOR_FROM in verify-daily-banks.mjs.
//   4. num/quizId/live/dateLabel are mutually consistent and sequential.
//   5. No duplicate boards (identical quizId/live or identical title).
//   6. US spelling: title/metric/hi/lo/source/item t/v/d are scanned for
//      obvious British word forms.
//
// Run: node scripts/verify-listed.mjs
import { PUZZLES } from '../app/listed/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played,
// never rewritten. The alternation/balance rule is enforced hard from here.
const LISTED_FLOOR_FROM = '2026-08-03';

// ─── value parser (handles every format actually shipped in the bank) ─────
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function parseListedValue(raw) {
  let s = String(raw).trim();
  const bc = /\bBC\b/i.test(s);
  s = s.replace(/\bBC\b/i, '').trim();
  s = s.replace(/^AD\s+/i, '').trim();
  s = s.replace(/^c\.\s*/i, '').trim();
  // duration "NN yr, NN d"
  let m = s.match(/^(\d+)\s*yr,\s*(\d+)\s*d$/i);
  if (m) return { ok: true, val: Number(m[1]) * 365.25 + Number(m[2]) };
  // month + year, e.g. "Apr 1970"
  m = s.match(/^([A-Za]{3})[a-z]*\s+(\d{4})$/i);
  if (m) {
    const mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi >= 0) return { ok: true, val: Number(m[2]) * 12 + mi };
  }
  // latitude "40.71 N"
  m = s.match(/^(-?\d+\.?\d*)\s*N$/i);
  if (m) return { ok: true, val: Number(m[1]) };
  // generic: $ / commas stripped, optional attached B/M/K/T or spelled-out
  // million/billion/thousand/trillion multiplier, trailing unit words ignored
  const t = s.replace(/\$/g, '').replace(/,/g, '');
  m = t.match(/^(-?\d+\.?\d*)\s*([A-Za-z]*)/);
  if (!m) return { ok: false };
  const num = Number(m[1]);
  const suf = (m[2] || '').toLowerCase();
  const rest = t.slice(m[0].length).trim().toLowerCase();
  let mult = 1;
  if (suf === 'b' || suf === 'bn') mult = 1e9;
  else if (suf === 'm') mult = 1e6;
  else if (suf === 'k') mult = 1e3;
  else if (suf === 't') mult = 1e12;
  else if (/^million\b/.test(rest)) mult = 1e6;
  else if (/^billion\b/.test(rest)) mult = 1e9;
  else if (/^thousand\b/.test(rest)) mult = 1e3;
  else if (/^trillion\b/.test(rest)) mult = 1e12;
  let val = num * mult;
  if (bc) val = -val;
  return { ok: true, val };
}

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenTitles = new Map();
const seenIds = new Set();
const catSeq = [];
PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^listed-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }
  if (seenIds.has(p.quizId)) errs.push('duplicate quizId'); seenIds.add(p.quizId);

  if (p.cat !== 'History' && p.cat !== 'Geography') errs.push(`cat "${p.cat}" is not History or Geography`);
  if (!p.title) errs.push('missing title'); else scanBritish(p.quizId, 'title', p.title);
  if (!p.metric) errs.push('missing metric'); else scanBritish(p.quizId, 'metric', p.metric);
  if (!p.hi) errs.push('missing hi'); else scanBritish(p.quizId, 'hi', p.hi);
  if (!p.lo) errs.push('missing lo'); else scanBritish(p.quizId, 'lo', p.lo);
  if (!p.source) errs.push('missing source'); else scanBritish(p.quizId, 'source', p.source);

  const wantN = p.sunday ? 9 : 8;
  if (!Array.isArray(p.items) || p.items.length !== wantN) errs.push(`${p.items?.length} items, want ${wantN} for ${p.sunday ? 'Sunday' : 'weekday'}`);
  else {
    const parsed = [];
    for (const it of p.items) {
      if (!it.t) errs.push('item missing t');
      if (!it.d) errs.push('item missing d'); else scanBritish(p.quizId, `d ("${it.t}")`, it.d);
      if (it.t) scanBritish(p.quizId, `t ("${it.t}")`, it.t);
      if (!it.v) { errs.push(`item "${it.t}" missing v`); parsed.push(null); continue; }
      const r = parseListedValue(it.v);
      if (!r.ok) { errs.push(`item "${it.t}" value "${it.v}" could not be parsed`); parsed.push(null); }
      else parsed.push(r.val);
    }
    if (parsed.every((v) => v !== null)) {
      let dir = 0, badPair = null;
      for (let k = 1; k < parsed.length; k++) {
        const d = Math.sign(parsed[k] - parsed[k - 1]);
        if (d === 0) { badPair = `"${p.items[k - 1].t}" (${p.items[k - 1].v}) ties "${p.items[k].t}" (${p.items[k].v})`; break; }
        if (dir === 0) dir = d;
        else if (d !== dir) { badPair = `order reverses between "${p.items[k - 1].t}" (${p.items[k - 1].v}) and "${p.items[k].t}" (${p.items[k].v})`; break; }
      }
      if (badPair) errs.push(`items are NOT in true value order: ${badPair}`);
    }
  }

  if (p.title) { seenTitles.set(p.title, (seenTitles.get(p.title) || []).concat(p.quizId)); }
  catSeq.push({ id: p.quizId, live: p.live, cat: p.cat });

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${p.cat}, ${p.items.length} items in true ${p.hi.toLowerCase()}-to-${p.lo.toLowerCase()} order`);
});

for (const [title, ids] of seenTitles) {
  if (ids.length > 1) fail('listed pool', `title "${title}" reused on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── domain alternation (pool variety) ─────────────────────────────────────
// Run-length: any 3+ consecutive boards sharing a cat, where the run touches
// an editable (live >= floor) board, is a hard fail; a run entirely in the
// past is grandfathered as a note.
let run = [];
const flushRun = () => {
  if (run.length >= 3) {
    const fresh = run.some((x) => x.live >= LISTED_FLOOR_FROM);
    const msg = `${run.length} consecutive ${run[0].cat} boards (${run.map((x) => x.id).join(', ')}), rule says the domain alternates`;
    if (fresh) fail('listed pool', msg);
    else note('listed pool', `grandfathered: ${msg}`);
  }
  run = [];
};
for (const x of catSeq) {
  if (run.length && run[run.length - 1].cat !== x.cat) flushRun();
  run.push(x);
}
flushRun();

const fresh = catSeq.filter((x) => x.live >= LISTED_FLOOR_FROM);
const freshHistory = fresh.filter((x) => x.cat === 'History').length;
const freshTotal = fresh.length;
if (freshTotal) {
  const frac = freshHistory / freshTotal;
  const msg = `${freshHistory}/${freshTotal} (${(frac * 100).toFixed(0)}%) editable boards are History, want roughly even (40-60%)`;
  if (frac < 0.4 || frac > 0.6) fail('listed pool', msg);
  else ok('listed pool', msg);
}
const allHistory = catSeq.filter((x) => x.cat === 'History').length;
note('listed pool', `whole bank: ${allHistory}/${catSeq.length} History (${((allHistory / catSeq.length) * 100).toFixed(0)}%)`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Listed boards verified.');
process.exit(BAD ? 1 : 0);
