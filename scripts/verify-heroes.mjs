#!/usr/bin/env node
// verify-heroes — the hero-photo gate for BOTH lib/hero-images.js (lists) and
// lib/quiz-heroes.js (quizzes).
//
//   node scripts/verify-heroes.mjs           run every check
//   node scripts/verify-heroes.mjs --live    also load every hero URL through
//                                            the live optimizer (slow, network)
//
// Why this exists. On 2026-08-21 an audit found 101 blank hero tiles across 55
// lists: every hero sourced from lh3.googleusercontent.com (a Google Maps place
// photo) had stopped resolving, both raw in the browser and through
// /_next/image. Nothing on the site said so, because a dead hero renders as an
// empty frame rather than an error. Each of the checks below is one defect that
// shipped and sat there unnoticed, so none of them is theoretical.
//
// Checks, in order of how badly they bite:
//   1. BANNED HOSTS. Photo URLs on a host that signs, rotates or expires its
//      links are not heroes, they are time bombs. Google user-content and the
//      Meta CDNs are the known offenders.
//   2. TOP-3 COVERAGE. Consensus moves; a hero keyed to the item that used to
//      be #3 leaves the new #3 with no photo at all.
//   3. FORMAT. Satori's Edge decoder cannot read WebP or AVIF, so a hero on a
//      format-negotiating CDN renders as a red fallback panel on the IG poster.
//   4. WIKIMEDIA UPSCALES. A /thumb/.../Npx- URL 404s whenever N exceeds the
//      source width, which is always true for non-free /wikipedia/en/ cover art.
//   5. SHAPE. Every hero carries {src, credit, creditUrl}; a bare string renders
//      with no attribution caption.
//   6. ORPHANS. A hero block for a list that no longer exists is dead weight.
//   7. QUIZ REGISTRY. Every heroed id must exist, the QOTD pool and overrides
//      must all be heroed, and the NEWEST quiz must be heroed (it drives the
//      hub's Newest tile).
import { register } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

register('./alias-loader.mjs', import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { LISTS } = await import(join(root, 'lib/data.js'));
const { HERO_IMAGES } = await import(join(root, 'lib/hero-images.js'));
const { getSources } = await import(join(root, 'lib/helpers.js'));
const { QUIZZES } = await import(join(root, 'lib/quizzes.js'));
const qh = await import(join(root, 'lib/quiz-heroes.js'));
const { QUIZ_HEROES, QOTD_POOL = [], QOTD_OVERRIDES = {} } = qh;

const live = process.argv.includes('--live');
const rebase = process.argv.includes('--baseline');

// GRANDFATHERED BACKLOG. scripts/hero-baseline.json lists the defects that
// already existed when this checker was written (2026-08-21). They are reported
// as notes, not failures, so the gate is GREEN on a clean tree and goes RED the
// moment a NEW one lands. That is deliberate: a checker that ships red is
// ignored within a week (see the verify-listed lesson in CLAUDE.md).
//
// The baseline is a BURN-DOWN LIST, not a permission slip. Fixing a hero and
// re-running with --baseline shrinks it; it must never grow. A new entry
// appearing in a diff means someone regenerated it to silence a real defect.
const BASELINE_PATH = join(root, 'scripts/hero-baseline.json');
const baseline = new Set(existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : []);
const seen = [];

let fails = 0, grandfathered = 0;
const fail = (key, msg) => {
  seen.push(key);
  if (baseline.has(key)) { grandfathered++; return; }
  fails++; console.log('✗ ' + msg);
};
const note = (msg) => console.log('… ' + msg);

// A host that signs, rotates, or expires its image URLs. These resolve on the
// day you gather them and silently 404/502 weeks later.
const BANNED_HOSTS = [
  /(^|\.)googleusercontent\.com$/i,   // Google Maps place photos (the 2026-08 outage)
  /(^|\.)fbcdn\.net$/i,               // Facebook / Instagram CDN, signed URLs
  /(^|\.)cdninstagram\.com$/i,
  /(^|\.)lookaside\.fbsbx\.com$/i,
  /(^|\.)ggpht\.com$/i,
];
// CDNs that pick the response format from the request's Accept header, so they
// hand WebP to a browser and break the Edge poster route.
const NEGOTIATING = [
  /res\.cloudinary\.com\/.*\/f_auto/i,
  /img\.belmond\.com/i,
  /assets\.kerzner\.com/i,
  /images\.axios\.com/i,
  /holidayexpert\.com/i,
];

const srcOf = (v) => (typeof v === 'string' ? v : v && v.src);
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return null; } };

// ---------------------------------------------------------------- collect
const entries = [];
for (const [lid, blk] of Object.entries(HERO_IMAGES)) {
  for (const [item, v] of Object.entries(blk)) {
    entries.push({ side: 'list', id: lid, item, v, src: srcOf(v) });
  }
}
for (const [qid, v] of Object.entries(QUIZ_HEROES)) {
  entries.push({ side: 'quiz', id: qid, item: '(quiz)', v, src: srcOf(v) });
}

// ------------------------------------------------------- 1. banned hosts
for (const e of entries) {
  const h = hostOf(e.src);
  if (h && BANNED_HOSTS.some((re) => re.test(h))) {
    fail(`host|${e.id}|${e.item}`, `banned host ${h} — ${e.id} :: ${e.item}. Expiring/signed photo URL; re-gather from the venue site, an editorial CDN, Wikimedia, or the venue's own Yelp business page.`);
  }
}

// ------------------------------------------------------ 2. top-3 coverage
const listIds = new Set(LISTS.map((l) => l.id));
for (const l of LISTS) {
  const s = getSources(l);
  const items = s.length && s[0].id === 'consensus'
    ? s[0].items
    : (l.sources && l.sources.ai && l.sources.ai.items) || (s[0] && s[0].items) || [];
  const blk = HERO_IMAGES[l.id];
  if (!blk) { fail(`block|${l.id}|`, `no hero block at all — ${l.id}`); continue; }
  items.slice(0, 3).forEach((it, i) => {
    if (!blk[it]) fail(`top3|${l.id}|${it}`, `consensus #${i + 1} has no hero — ${l.id} :: ${it}`);
  });
}

// -------------------------------------------------------------- 3. format
for (const e of entries) {
  if (!e.src) { fail(`nosrc|${e.id}|${e.item}`, `hero has no src — ${e.id} :: ${e.item}`); continue; }
  if (!/^https:\/\//.test(e.src) && !/^\//.test(e.src)) {
    fail(`scheme|${e.id}|${e.item}`, `hero src is neither https nor a local path — ${e.id} :: ${e.item}`);
  }
  if (/\.(webp|avif)(\?|$)/i.test(e.src)) {
    fail(`webp|${e.id}|${e.item}`, `WebP/AVIF hero — ${e.id} :: ${e.item}. The Edge poster route cannot decode it and renders a red panel.`);
  }
  if (NEGOTIATING.some((re) => re.test(e.src))) {
    fail(`negotiate|${e.id}|${e.item}`, `format-negotiating CDN — ${e.id} :: ${e.item}. This host serves WebP to anything that accepts it.`);
  }
}

// -------------------------------------------------- 4. wikimedia upscales
for (const e of entries) {
  if (/upload\.wikimedia\.org\/wikipedia\/en\/.*\/thumb\//.test(e.src || '')) {
    fail(`wmthumb|${e.id}|${e.item}`, `non-free Wikimedia thumb — ${e.id} :: ${e.item}. /wikipedia/en/ cover art is low-res, so the thumbnailer 404s on any upscale. Point src at the original file (drop /thumb/ and the /<N>px- suffix).`);
  }
}

// --------------------------------------------------------------- 5. shape
for (const e of entries) {
  if (e.side !== 'list') continue;
  if (typeof e.v === 'string') {
    fail(`shape|${e.id}|${e.item}`, `legacy string hero, no credit — ${e.id} :: ${e.item}. Use { src, credit, creditUrl }.`);
  } else if (!e.v.credit || !e.v.creditUrl) {
    fail(`shape|${e.id}|${e.item}`, `hero missing credit/creditUrl — ${e.id} :: ${e.item}`);
  }
}

// ------------------------------------------------------------- 6. orphans
for (const lid of Object.keys(HERO_IMAGES)) {
  if (!listIds.has(lid)) note(`orphan hero block, list no longer exists — ${lid}`);
}

// ------------------------------------------------------- 7. quiz registry
const qids = new Set(QUIZZES.map((q) => q.id));
for (const qid of Object.keys(QUIZ_HEROES)) {
  if (!qids.has(qid)) fail(`qorphan|${qid}|`, `QUIZ_HEROES id is not a quiz — ${qid}`);
}
for (const qid of QOTD_POOL) {
  if (!QUIZ_HEROES[qid]) fail(`qpool|${qid}|`, `QOTD_POOL entry has no hero — ${qid}`);
  if (!qids.has(qid)) fail(`qpoolid|${qid}|`, `QOTD_POOL entry is not a quiz — ${qid}`);
}
for (const [date, qid] of Object.entries(QOTD_OVERRIDES)) {
  if (!QUIZ_HEROES[qid]) fail(`qover|${date}|${qid}`, `QOTD_OVERRIDES[${date}] points at an unheroed quiz — ${qid}`);
}
const newest = [...QUIZZES].sort((a, b) =>
  String(b.publishedAt || b.publishedDate || '').localeCompare(String(a.publishedAt || a.publishedDate || '')))[0];
if (newest && !QUIZ_HEROES[newest.id]) {
  fail(`qnewest|${newest.id}|`, `the NEWEST quiz has no hero — ${newest.id}. It drives the hub's Newest tile, which falls back to a department photo without one.`);
}

// ---------------------------------------------------------------- 8. live
if (live) {
  const remote = entries.filter((e) => /^https:/.test(e.src || ''));
  note(`live-checking ${remote.length} remote hero URLs through the optimizer...`);
  const ORIGIN = process.env.HERO_ORIGIN || 'https://mindloftdaily.com';
  let dead = 0;
  const q = [...remote];
  const worker = async () => {
    while (q.length) {
      const e = q.shift();
      try {
        const r = await fetch(`${ORIGIN}/_next/image?url=${encodeURIComponent(e.src)}&w=1200&q=75`);
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !/^image\//.test(ct)) { dead++; fail(`live|${e.id}|${e.item}`, `dead hero (${r.status}) — ${e.id} :: ${e.item} [${hostOf(e.src)}]`); }
      } catch { dead++; fail(`live|${e.id}|${e.item}`, `hero fetch failed — ${e.id} :: ${e.item}`); }
    }
  };
  await Promise.all(Array.from({ length: 10 }, worker));
  note(`live check done, ${dead} dead of ${remote.length}`);
}

if (rebase) {
  writeFileSync(BASELINE_PATH, JSON.stringify(seen.sort(), null, 1) + '\n');
  console.log(`baseline rewritten: ${seen.length} grandfathered defect(s) -> scripts/hero-baseline.json`);
  process.exit(0);
}
const stale = [...baseline].filter((k) => !seen.includes(k));
if (stale.length) note(`${stale.length} baseline entr${stale.length === 1 ? 'y is' : 'ies are'} FIXED and can be dropped: re-run with --baseline`);
if (grandfathered) note(`${grandfathered} known defect(s) grandfathered in scripts/hero-baseline.json — this is the burn-down backlog, work it down`);

console.log(`\nheroes: ${entries.length} entries (${entries.filter((e) => e.side === 'list').length} list, ${entries.filter((e) => e.side === 'quiz').length} quiz) across ${Object.keys(HERO_IMAGES).length} list blocks`);
console.log(fails ? `FAIL: ${fails} problem(s)` : 'OK: every hero check passed');
process.exit(fails ? 1 : 0);
