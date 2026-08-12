// Verify the Listed (daily "rank these eight things by one number" puzzle)
// bank. Listed's own header comment (app/listed/puzzles.js) and its client's
// rules copy (ListedClient.jsx) promise, per puzzle:
//   - `items` stored in TRUE ORDER (index 0 = rank 1, the item `hi` names);
//   - `cat` is one of "History", "Geography" or "Trivia", and the domain
//     ROTATES through the week rather than running mostly one with the
//     occasional other. Owner ruling 2026-08-04 added Trivia as a real third
//     domain and supersedes the 2026-07-27 two-domain rule: History is for a
//     dated event (chronologies, founding years, "oldest still running"),
//     Geography for genuinely spatial boards, and Trivia for records,
//     best-sellers, career totals, revenue, capacities and award counts. This
//     checker enforced the superseded two-domain rule until 2026-08-12, which
//     is why it failed all 15 legitimate Trivia boards;
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
//   3. Domain rotation (pool variety): no run of 3+ same-`cat` boards, and no
//      single domain takes less than DOMAIN_MIN or more than DOMAIN_MAX of the
//      editable window -- an even three-way split is 33% each, and the band is
//      wide enough that ordinary variation over a 35-board window cannot trip
//      it while a bank that collapses onto one domain still does. Applies to
//      every board live on or after
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
// The three domains, per the owner ruling in app/listed/puzzles.js (2026-08-04).
const DOMAINS = ['History', 'Geography', 'Trivia'];
const DOMAIN_MIN = 0.20, DOMAIN_MAX = 0.45;   // even is 0.33 each

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

  if (!DOMAINS.includes(p.cat)) errs.push(`cat "${p.cat}" is not one of ${DOMAINS.join(', ')}`);
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
  catSeq.push({ id: p.quizId, live: p.live, cat: p.cat, title: p.title });

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
if (fresh.length) {
  const share = (c) => fresh.filter((x) => x.cat === c).length;
  const parts = DOMAINS.map((c) => `${c} ${share(c)} (${((share(c) / fresh.length) * 100).toFixed(0)}%)`);
  const off = DOMAINS.filter((c) => {
    const f = share(c) / fresh.length;
    return f < DOMAIN_MIN || f > DOMAIN_MAX;
  });
  const msg = `${fresh.length} editable boards: ${parts.join(', ')}`;
  if (off.length) fail('listed pool', `${msg} — ${off.join(' and ')} outside the ${DOMAIN_MIN * 100}-${DOMAIN_MAX * 100}% band`);
  else ok('listed pool', msg);
}
note('listed pool', `whole bank: ${DOMAINS.map((c) => `${c} ${catSeq.filter((x) => x.cat === c).length}`).join(', ')}`);

// Trivia is the widest domain, so it is the one that can quietly become a
// sports bank. A heuristic read of the titles, reported as a NOTE and never a
// gate: the classifier is a keyword list and would be the wrong thing to fail
// a board on, but a two-thirds sports share is worth seeing before it ships.
const SPORTY = /\b(NBA|NHL|NFL|MLB|golf|Formula One|stadium|home runs?|goals?|passing yards|championships?|Olympi|tennis|soccer|cricket|marathon|Grand Slam|World Cup|Super Bowl)\b/i;
const trivia = catSeq.filter((x) => x.cat === 'Trivia');
if (trivia.length) {
  const sporty = trivia.filter((x) => SPORTY.test(x.title || '')).length;
  const line = `Trivia mix: ${sporty}/${trivia.length} boards read as sport`;
  if (sporty / trivia.length > 0.5) note('listed pool', `${line} — spread the next few across screen, music, books and business`);
  else note('listed pool', line);
}

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Listed boards verified.');
process.exit(BAD ? 1 : 0);
