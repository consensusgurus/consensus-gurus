// Suffice engine: the scenarios and the sufficiency decision, in ONE place.
//
// Three consumers share this file and must never drift apart:
//   scripts/gen-suffice.mjs     builds the bank
//   scripts/verify-suffice.mjs  re-derives every stored letter from chk
//   app/suffice/SufficeClient    re-derives the answer in the browser, so the
//                                server can strip `letter` and the key never
//                                ships (the Sworn leak-guard pattern)
//
// Copying any of this into a consumer is how a mirror drifts. Import it.
//
// A "scenario" is a domain plus questions and statements over it. Sufficiency
// of a statement S for a question Q is decidable: the answer to Q is the same
// at every point of the domain satisfying S. That is a total computation, which
// is why generation and verification can be the same thing run twice.

// ───────────────────────── exact rational arithmetic ─────────────────────────
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const k = gcd(Math.abs(n), d) || 1; return [n / k, d / k]; };
const sub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const dv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
const I = (n) => [n, 1];
export function rank(rows) {
  if (!rows.length) return 0;
  const M = rows.map((r) => r.map((x) => [...x]));
  let r = 0;
  for (let c = 0; c < M[0].length && r < M.length; c++) {
    let p = -1;
    for (let i = r; i < M.length; i++) if (M[i][c][0] !== 0) { p = i; break; }
    if (p < 0) continue;
    [M[r], M[p]] = [M[p], M[r]];
    const lead = M[r][c];
    M[r] = M[r].map((x) => dv(x, lead));
    for (let i = 0; i < M.length; i++) {
      if (i === r || M[i][c][0] === 0) continue;
      const f = M[i][c];
      M[i] = M[i].map((x, j) => sub(x, mul(f, M[r][j])));
    }
    r++;
  }
  return r;
}
export const lcm = (a, b) => (a * b) / gcd(a, b);

// ══════════════════════════════ family: LIN ══════════════════════════════════
// Statements are linear equations, the question asks for the value of a linear
// functional c·x. Sufficiency needs no search at all: c·x is determined exactly
// when c lies in the row space of the statement coefficients and the system is
// consistent. Exact over the rationals.
//
// LIN CANNOT PRODUCE D, structurally. Each statement alone fixing c·x forces
// both coefficient rows parallel to c, hence to each other, hence redundant.
// The verifier asserts this rather than trusting it.
const VN = ['x', 'y', 'z'];
export function linClassify(e1, e2, c) {
  const A1 = [e1.a.map(I)], A2 = [e2.a.map(I)], A12 = [e1.a.map(I), e2.a.map(I)];
  const aug = (A, es) => A.map((r, i) => [...r, I(es[i].b)]);
  const cons = (A, es) => rank(A) === rank(aug(A, es));
  const spans = (A, es) => cons(A, es) && rank(A) === rank([...A, c.map(I)]);
  if (!cons(A12, [e1, e2]) || rank(A12) < 2) return null;
  const u1 = spans(A1, [e1]), u2 = spans(A2, [e2]), u12 = spans(A12, [e1, e2]);
  return u1 && u2 ? 'D' : u1 ? 'A' : u2 ? 'B' : u12 ? 'C' : 'E';
}
export function linText(a, b) {
  const parts = a.map((cc, i) => [cc, VN[i]]).filter(([cc]) => cc !== 0);
  return parts.map(([cc, v], i) => {
    const mag = Math.abs(cc) === 1 ? v : `${Math.abs(cc)}${v}`;
    return i === 0 ? `${cc < 0 ? '-' : ''}${mag}` : ` ${cc < 0 ? '-' : '+'} ${mag}`;
  }).join('') + (b === null ? '' : ` = ${b}`);
}
// primitive direction, so 2x+4y and -x-2y count as one question template
export function dir(a) {
  const k = a.reduce((m, v) => gcd(m, Math.abs(v)), 0) || 1;
  const r = a.map((v) => v / k);
  const lead = r.find((v) => v !== 0);
  return lead < 0 ? r.map((v) => -v) : r;
}
export function renderLin(e1, e2, c) {
  return {
    stem: `${VN.slice(0, c.length).join(', ')} are numbers.`,
    ask: `What is the value of ${linText(c, null)}?`,
    s1: linText(e1.a, e1.b) + '.', s2: linText(e2.a, e2.b) + '.',
    dir: dir(c).join(','),
  };
}

// ══════════════════════════════ family: MOD ══════════════════════════════════
// Every modulus below divides 2520, so one pass over n = 1..2520 settles
// sufficiency for EVERY positive integer. That is periodicity, not sampling,
// and it is what lets the stem say "n is a positive integer" with no ceiling.
// The verifier fails any item whose modulus does not divide the period.
export const MOD_PERIOD = 2520;
export const MOD_MODULI = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15];

function modScenario() {
  const dom = Array.from({ length: MOD_PERIOD }, (_, i) => i + 1);
  const QS = [
    { id: 'even', m: 2, ask: 'Is n even?', f: (n) => n % 2 === 0 },
    { id: 'div6', m: 6, ask: 'Is n divisible by 6?', f: (n) => n % 6 === 0 },
    { id: 'div10', m: 10, ask: 'Is n divisible by 10?', f: (n) => n % 10 === 0 },
    { id: 'div12', m: 12, ask: 'Is n divisible by 12?', f: (n) => n % 12 === 0 },
    { id: 'div15', m: 15, ask: 'Is n divisible by 15?', f: (n) => n % 15 === 0 },
    { id: 'rem4', m: 4, ask: 'What is the remainder when n is divided by 4?', f: (n) => n % 4 },
    { id: 'rem5', m: 5, ask: 'What is the remainder when n is divided by 5?', f: (n) => n % 5 },
    { id: 'rem9', m: 9, ask: 'What is the remainder when n is divided by 9?', f: (n) => n % 9 },
    { id: 'units', m: 10, ask: 'What is the units digit of n?', f: (n) => n % 10 },
    { id: 'oddDiv3', m: 6, ask: 'Is n an odd multiple of 3?', f: (n) => n % 6 === 3 },
  ];
  const S = [];
  for (const k of MOD_MODULI) S.push({ id: `d${k}`, mod: k, text: `n is divisible by ${k}.`, p: (n) => n % k === 0 });
  for (const k of [3, 4, 5, 6, 7, 8, 9, 10, 12]) for (let r = 1; r < k; r++) S.push({ id: `r${k}.${r}`, mod: k, text: `When n is divided by ${k}, the remainder is ${r}.`, p: (n) => n % k === r });
  S.push({ id: 'oddM3', mod: 6, text: 'n is an odd multiple of 3.', p: (n) => n % 6 === 3 });
  S.push({ id: 'nP1d4', mod: 4, text: 'n + 1 is divisible by 4.', p: (n) => (n + 1) % 4 === 0 });
  S.push({ id: 'nM1d6', mod: 6, text: 'n - 1 is divisible by 6.', p: (n) => ((n - 1) % 6 + 6) % 6 === 0 });
  S.push({ id: 'nSqD4', mod: 2, text: 'n² is divisible by 4.', p: (n) => (n * n) % 4 === 0 });
  S.push({ id: 'halfOdd', mod: 4, text: 'n/2 is an odd integer.', p: (n) => n % 4 === 2 });
  return {
    fam: 'MOD', stem: 'n is a positive integer.', dom, QS, S,
    show: (n) => `n = ${n}`,
    legal: (q, s) => !(q.id.startsWith('div') && s.id === `d${q.m}`)
      && !(q.id === 'even' && (s.id === 'd2' || s.id === 'nSqD4'))
      && !(q.id === 'oddDiv3' && s.id === 'oddM3'),
    pairLegal: (s1, s2) => s1.mod !== s2.mod,
    proofFor: (q, s1, s2) => `one period of ${[q.m, s1.mod, s2.mod].reduce(lcm)}`,
  };
}

// ══════════════════════════════ family: SETS ═════════════════════════════════
// Two overlapping activities in a group of N. The domain is every split of N
// into the four regions, so the bound is the premise the player is told, not a
// limit of the checker.
export const ACTS = [['tennis', 'golf'], ['French', 'German'], ['guitar', 'piano'], ['chess', 'bridge'], ['swimming', 'cycling'], ['pottery', 'painting'], ['running', 'rowing']];
function setsScenario(N, A, B) {
  const dom = [];
  for (let a = 0; a <= N; a++) for (let b = 0; a + b <= N; b++) for (let c = 0; a + b + c <= N; c++) dom.push({ a, b, c, d: N - a - b - c });
  const QS = [
    { id: 'both', ask: 'How many of them do both?', f: (s) => s.c },
    { id: 'onlyA', ask: `How many of them do ${A} only?`, f: (s) => s.a },
    { id: 'neither', ask: 'How many of them do neither?', f: (s) => s.d },
    { id: 'moreA', ask: `Do more of them do ${A} than ${B}?`, f: (s) => s.a > s.b },
    { id: 'atLeast', ask: 'How many of them do at least one of the two?', f: (s) => s.a + s.b + s.c },
  ];
  const S = [];
  const add = (id, text, p) => S.push({ id, text, p });
  for (const v of [...new Set([N / 2, N / 2 + 4, N * 0.6, N * 0.7].map(Math.round))]) if (v > 0 && v <= N) add(`A${v}`, `${v} of them do ${A}.`, (s) => s.a + s.c === v);
  for (const v of [...new Set([N / 3, N / 2, N * 0.4].map(Math.round))]) if (v > 0 && v <= N) add(`B${v}`, `${v} of them do ${B}.`, (s) => s.b + s.c === v);
  // v=0 deliberately absent: "0 of them do neither" is the same predicate as
  // allOne in clumsier words, and a pool holding one fact twice lets the same
  // item be generated under two names.
  for (const v of [3, 4, 5, 6, 8, 10]) if (v <= N) add(`N${v}`, `${v} of them do neither.`, (s) => s.d === v);
  for (const v of [4, 6, 8, 10, 12]) if (v <= N) add(`C${v}`, `${v} of them do both.`, (s) => s.c === v);
  for (const k of [2, 3, 4, 5]) if (N % k === 0) add(`Ak${k}`, `Exactly one ${k === 2 ? 'half' : k === 3 ? 'third' : k === 4 ? 'quarter' : 'fifth'} of them do ${A}.`, (s) => k * (s.a + s.c) === N);
  add('twiceC', `Twice as many do ${A} only as do both.`, (s) => s.a === 2 * s.c);
  add('eqOnly', `The number who do only ${A} equals the number who do only ${B}.`, (s) => s.a === s.b);
  add('allOne', 'Everyone does at least one of the two.', (s) => s.d === 0);
  add('noneBoth', 'No one does both.', (s) => s.c === 0);
  add('moreBoth', 'More do both than do neither.', (s) => s.c > s.d);
  // AeqB deliberately absent: a+c === b+c reduces to a === b, which is eqOnly.
  return {
    fam: 'SETS', stem: `In a group of ${N} people, each person does ${A}, ${B}, both, or neither.`,
    dom, QS, S,
    show: (s) => `${s.a} ${A} only, ${s.b} ${B} only, ${s.c} both, ${s.d} neither`,
    // Tautology gates. A statement that restates the question is legal and
    // sufficient and completely worthless, which is how "how many do at least
    // one of the two / (1) everyone does at least one of the two" got built.
    legal: (q, s) => !(q.id === 'both' && s.id.startsWith('C'))
      && !(q.id === 'neither' && (s.id.startsWith('N') || s.id === 'allOne'))
      && !(q.id === 'atLeast' && s.id === 'allOne')
      && !(q.id === 'moreA' && s.id === 'eqOnly'),
    pairLegal: () => true,
    proofFor: () => `all ${dom.length} splits of ${N}`,
  };
}

// ══════════════════════════════ family: STAT ═════════════════════════════════
// L integers from 1 to HI. Every question is symmetric in the list, so the
// domain is sorted multisets and the enumeration stays small.
function statScenario(LEN, HI) {
  const dom = [];
  (function b(start, acc) { if (acc.length === LEN) { dom.push(acc.slice()); return; } for (let v = start; v <= HI; v++) { acc.push(v); b(v, acc); acc.pop(); } })(1, []);
  const sum = (L) => L.reduce((a, b2) => a + b2, 0);
  const mid = (LEN - 1) / 2;
  const QS = [
    { id: 'median', ask: 'What is the median of the list?', f: (L) => L[mid] },
    { id: 'mean', ask: 'What is the average of the list?', f: (L) => sum(L) / LEN },
    { id: 'range', ask: 'What is the range of the list?', f: (L) => L[LEN - 1] - L[0] },
    { id: 'medGtMean', ask: 'Is the median greater than the average?', f: (L) => L[mid] > sum(L) / LEN },
    { id: 'repeat', ask: 'Does any number appear more than once?', f: (L) => new Set(L).size < LEN },
  ];
  const S = [];
  const add = (id, text, p) => S.push({ id, text, p });
  for (let v = 3; v <= HI - 1; v++) add(`avg${v}`, `The average of the list is ${v}.`, (L) => sum(L) === LEN * v);
  for (let v = HI - 2; v <= HI; v++) add(`max${v}`, `The largest number is ${v}.`, (L) => L[LEN - 1] === v);
  for (let v = 1; v <= 3; v++) add(`min${v}`, `The smallest number is ${v}.`, (L) => L[0] === v);
  for (let v = 2; v <= 5; v++) add(`rng${v}`, `The range of the list is ${v}.`, (L) => L[LEN - 1] - L[0] === v);
  for (let k = 1; k < LEN; k++) add(`ev${k}`, k === 1 ? 'Exactly one of the numbers is even.' : `Exactly ${k} of the numbers are even.`, (L) => L.filter((x) => x % 2 === 0).length === k);
  for (let v = 3; v <= HI - 1; v++) add(`med${v}`, `The median is ${v}.`, (L) => L[mid] === v);
  add('allDiff', 'No number appears more than once.', (L) => new Set(L).size === LEN);
  add('same3', 'Exactly three of the numbers are equal to one another.', (L) => Object.values(L.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {})).includes(3));
  add('sumEven', 'The sum of the numbers is even.', (L) => sum(L) % 2 === 0);
  add('endsOnce', 'The largest and smallest numbers each appear exactly once.', (L) => L.filter((x) => x === L[0]).length === 1 && L.filter((x) => x === L[LEN - 1]).length === 1);
  return {
    fam: 'STAT', stem: `A list consists of ${LEN} integers, each from 1 to ${HI}.`, dom, QS, S,
    show: (L) => `[${L.join(', ')}]`,
    legal: (q, s) => !(q.id === 'median' && s.id.startsWith('med'))
      && !(q.id === 'range' && s.id.startsWith('rng'))
      && !(q.id === 'mean' && s.id.startsWith('avg'))
      && !(q.id === 'repeat' && (s.id === 'allDiff' || s.id === 'same3')),
    pairLegal: () => true,
    proofFor: () => `all ${dom.length} sorted lists`,
  };
}

// ───────────────── the scenario pool, fixed and index-addressed ──────────────
// puzzles.js stores `chk.scen` as an INDEX into these lists, so the order is
// load-bearing: never reorder or remove an entry, only append. A distinct
// activity pair per SETS scenario, assigned rather than drawn, because sampling
// produced three chess/bridge scenarios and days that read as one premise.
export const SETS_SIZES = [30, 40, 45, 50, 60];
export const STAT_SHAPES = [[5, 8], [5, 9], [5, 10], [7, 8], [7, 9]];
export const SCENARIO_COUNTS = { MOD: 1, SETS: SETS_SIZES.length, STAT: STAT_SHAPES.length };

// BUILT LAZILY AND MEMOISED, because the browser imports this file too. A
// SETS scenario for N=60 is ~40,000 objects and STAT is a few thousand more;
// building all eleven at module load would cost the client a visible hitch on
// every page view to support the one scenario the current item actually needs.
// The client only ever asks for the item in front of the player.
const CACHE = new Map();
export function getScenario(fam, idx) {
  const key = `${fam}:${idx}`;
  if (CACHE.has(key)) return CACHE.get(key);
  let sc = null;
  if (fam === 'MOD' && idx === 0) sc = modScenario();
  else if (fam === 'SETS' && SETS_SIZES[idx] !== undefined) sc = setsScenario(SETS_SIZES[idx], ...ACTS[idx % ACTS.length]);
  else if (fam === 'STAT' && STAT_SHAPES[idx] !== undefined) sc = statScenario(...STAT_SHAPES[idx]);
  if (!sc) return null;
  CACHE.set(key, sc);
  return sc;
}

// ───────────────── the shared sufficiency decision ───────────────────────────
// Used by the generator to build, the verifier to re-derive, and the client to
// mark the player's answer.
export function decide(sc, qId, s1Id, s2Id) {
  const q = sc.QS.find((x) => x.id === qId);
  const s1 = sc.S.find((x) => x.id === s1Id);
  const s2 = sc.S.find((x) => x.id === s2Id);
  if (!q || !s1 || !s2) return { err: `unknown id (${qId}/${s1Id}/${s2Id})` };
  const A1 = sc.dom.filter(s1.p), A2 = sc.dom.filter(s2.p);
  const bo = sc.dom.filter((d) => s1.p(d) && s2.p(d));
  if (!bo.length) return { err: 'statements cannot both hold' };
  if (A1.length < 2 || A2.length < 2) return { err: 'a statement pins the whole domain' };
  if (bo.length === A1.length || bo.length === A2.length) return { err: 'one statement adds nothing' };
  if (!sc.legal(q, s1) || !sc.legal(q, s2)) return { err: 'statement restates the question' };
  if (!sc.pairLegal(s1, s2)) return { err: 'illegal statement pairing' };
  const one = (set) => new Set(set.map(q.f)).size === 1;
  const u1 = one(A1), u2 = one(A2), u12 = one(bo);
  return { letter: u1 && u2 ? 'D' : u1 ? 'A' : u2 ? 'B' : u12 ? 'C' : 'E', q, s1, s2 };
}

// ───────────────── why a statement is not enough: the counterexample ─────────
// A DS reveal that only says "not sufficient" teaches nothing. This returns two
// concrete points of the domain that BOTH satisfy the given statements and yet
// answer the question differently, which is the actual proof of insufficiency
// and the thing a player wants to see. Returns null when the statements ARE
// sufficient (there is no such pair, by definition).
export function witness(sc, qId, sIds) {
  const q = sc.QS.find((x) => x.id === qId);
  const ss = sIds.map((id) => sc.S.find((x) => x.id === id));
  if (!q || ss.some((s) => !s)) return null;
  const seen = new Map();
  for (const d of sc.dom) {
    if (!ss.every((s) => s.p(d))) continue;
    const a = q.f(d);
    if (!seen.has(a)) seen.set(a, d);
    if (seen.size === 2) {
      const [[v1, d1], [v2, d2]] = [...seen.entries()];
      return { a: { show: sc.show(d1), answer: fmtAns(v1) }, b: { show: sc.show(d2), answer: fmtAns(v2) } };
    }
  }
  return null;
}
const fmtAns = (v) => (v === true ? 'yes' : v === false ? 'no' : String(v));

// The five fixed answer choices, in the order every DS item presents them.
export const CHOICES = [
  { k: 'A', text: 'Statement (1) ALONE is sufficient, but statement (2) alone is not.' },
  { k: 'B', text: 'Statement (2) ALONE is sufficient, but statement (1) alone is not.' },
  { k: 'C', text: 'BOTH statements TOGETHER are sufficient, but neither alone is.' },
  { k: 'D', text: 'EACH statement ALONE is sufficient.' },
  { k: 'E', text: 'The two statements TOGETHER are still not sufficient.' },
];
