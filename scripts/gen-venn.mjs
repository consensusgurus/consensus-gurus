// gen-venn — search for sound Venn boards, letter or knowledge.
//
// Authoring a board by hand means guessing three rules and then discovering
// one of the seven regions is empty, or that the triple overlap swallowed six
// items. This searches instead: it takes a candidate pool, tries rule triples,
// buckets the pool by region, and only emits a triple where all seven regions
// can be filled inside the caps the verifier enforces (each region 1-3 on a
// weekday, triple overlap 1-2, twelve items, nothing outside).
//
// It proposes; it does not ship. Everything it prints still goes through
// scripts/verify-venn.mjs, and knowledge boards still want a human read for
// whether the FACTS are fair, which no search can judge.
//
//   node scripts/gen-venn.mjs country 12       12 boards over the country table
//   node scripts/gen-venn.mjs letters 8        8 boards over the existing word pool
import { ruleFn } from '../lib/venn-rules.js';
import { DOMAINS } from '../lib/venn-facts.js';
import { PUZZLES } from '../app/venn/puzzles.js';

const REGIONS = [1, 2, 4, 3, 5, 6, 7];
const ORTH = [
  { k: 'dbl' }, { k: 'norepeat' }, { k: 'sameends' }, { k: 'startvowel' },
  { k: 'endvowel' }, { k: 'twinvowel' }, { k: 'onevowel' }, { k: 'alpha' },
  { k: 'len', n: 4 }, { k: 'len', n: 5 }, { k: 'len', n: 6 }, { k: 'len', n: 7 },
  { k: 'lenGte', n: 6 }, { k: 'lenGte', n: 7 }, { k: 'lenGte', n: 8 },
  { k: 'vowels', n: 2 }, { k: 'vowels', n: 3 }, { k: 'vowels', n: 4 },
  ...'ABCDEFGHILMNOPRSTU'.split('').map((c) => ({ k: 'nolet', c })),
];

// Every target split of twelve items across the seven regions that the
// verifier would accept. Precomputed once so the search can stop early on a
// rule triple whose buckets cannot cover any of them.
const SUNDAY = process.argv.includes('--sunday');
const TOTAL = SUNDAY ? 15 : 12;
const CAP = SUNDAY ? 4 : 3;
const TARGETS = [];
{
  const span = Array.from({ length: CAP }, (_, i) => i + 1);
  for (const a of span) for (const b of span) for (const c of span)
    for (const d of span) for (const e of span) for (const f of span) for (const g of [1, 2]) {
      if (a+b+c+d+e+f+g === TOTAL) TARGETS.push({ 1:a, 2:b, 4:c, 3:d, 5:e, 6:f, 7:g });
    }
}

function bucketise(pool, rules, domain) {
  const fns = rules.map((r) => ruleFn(r, domain));
  const buckets = {}; REGIONS.forEach((r) => { buckets[r] = []; });
  for (const w of pool) {
    const r = (fns[0](w) ? 1 : 0) | (fns[1](w) ? 2 : 0) | (fns[2](w) ? 4 : 0);
    if (r !== 0) buckets[r].push(w);
  }
  return buckets;
}

// A triple is only worth reporting when every region has something in it and
// some legal split of twelve fits inside the buckets. Prefer the split that
// spreads widest, so a board does not stack three items in one lobe and one
// everywhere else.
function fill(buckets) {
  const best = TARGETS.filter((t) => REGIONS.every((r) => buckets[r].length >= t[r]));
  if (!best.length) return null;
  best.sort((x, y) => {
    const sd = (t) => REGIONS.reduce((s, r) => s + (t[r] - TOTAL/7) ** 2, 0);
    return sd(x) - sd(y);
  });
  const t = best[0];
  const items = [];
  // Buckets are in table order and the tables lead with the better-known
  // entities, so taking from the front biases toward names a player will
  // recognise rather than the deepest cut available.
  REGIONS.forEach((r) => { items.push(...buckets[r].slice(0, t[r])); });
  return { split: t, items };
}

const [mode, nWanted = '10'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const want = Number(nWanted);

let pool, domain, ruleSets;
if (mode === 'letters') {
  domain = null;
  pool = [...new Set(PUZZLES.flatMap((p) => p.items))].filter((w) => /^[A-Z]{3,9}$/.test(w));
  ruleSets = [];
  for (let i = 0; i < ORTH.length; i++) for (let j = i+1; j < ORTH.length; j++) for (let k = j+1; k < ORTH.length; k++) {
    ruleSets.push([ORTH[i], ORTH[j], ORTH[k]]);
  }
} else {
  domain = mode;
  const d = DOMAINS[domain];
  if (!d) { console.error(`unknown domain "${mode}" (have: ${Object.keys(DOMAINS).join(', ')}, letters)`); process.exit(1); }
  pool = Object.keys(d.rows).filter((w) => w.length <= 9);
  const facts = Object.keys(d.props).map((p) => ({ k: 'fact', p }));
  ruleSets = [];
  // Two facts and a letter rule is the house style: the knowledge carries the
  // board, the letter rule gives a player who does not know the subject a
  // foothold and keeps the triple overlap from being pure trivia.
  for (let i = 0; i < facts.length; i++) for (let j = i+1; j < facts.length; j++) for (const o of ORTH) {
    ruleSets.push([facts[i], facts[j], o]);
  }
  // One fact and two letter rules, for a lighter board.
  for (const f of facts) for (let i = 0; i < ORTH.length; i++) for (let j = i+1; j < ORTH.length; j++) {
    ruleSets.push([f, ORTH[i], ORTH[j]]);
  }
}

const found = [];
for (const rules of ruleSets) {
  const buckets = bucketise(pool, rules, domain);
  if (REGIONS.some((r) => !buckets[r].length)) continue;
  const f = fill(buckets);
  if (!f) continue;
  found.push({ rules, ...f, slack: REGIONS.reduce((s, r) => s + buckets[r].length, 0) });
}

// Spread the output across distinct rule shapes rather than printing twenty
// near-identical boards that differ only in which letter is banned.
const bySig = new Map();
for (const b of found) {
  const sig = b.rules.map((r) => r.k === 'fact' ? `fact:${r.p}` : r.k).sort().join('|');
  if (!bySig.has(sig)) bySig.set(sig, []);
  bySig.get(sig).push(b);
}
const picked = [];
// Rule shapes come out of the loops grouped by fact pair, so walking them in
// order returns twenty boards that all read "in Europe / landlocked / some
// letter thing". Order by a stable hash instead: same output every run, but
// consecutive suggestions differ in their subject as well as their letter rule.
const hash = (s) => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const keys = [...bySig.keys()].sort((a, b) => hash(a) - hash(b));
for (let round = 0; picked.length < want && round < 40; round++) {
  for (const key of keys) {
    const list = bySig.get(key);
    if (list[round]) picked.push(list[round]);
    if (picked.length >= want) break;
  }
}

console.log(`pool ${pool.length}, ${found.length} sound triples across ${bySig.size} rule shapes\n`);
for (const b of picked) {
  const rl = b.rules.map((r) => JSON.stringify(r)).join(', ');
  console.log(`rules: [${rl}]`);
  console.log(`items: ${JSON.stringify(b.items)}`);
  console.log(`split: ${REGIONS.map((r) => `${r}:${b.split[r]}`).join(' ')}\n`);
}
