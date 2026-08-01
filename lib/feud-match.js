// Feud's acceptance layer: turning one player's free text into an answer
// bucket. Split out of lib/feud-score.js so it has ZERO imports and can be
// exercised directly by scripts/verify-feud.mjs, which is the gate that proves
// every banked label and alias still resolves to its own bucket.
//
// Imported by lib/feud-score.js (live scoring) and the verify script. Any
// change here changes what players are credited for, so re-run the audit:
//
//   node scripts/verify-feud.mjs
//
// ---------------------------------------------------------------------------
// ACCEPTANCE LAYER (rewritten 2026-08-01: generous matching)
//
// Feud is typed blind, so a player who MEANT the right answer must land in the
// right bucket. The first version matched raw substrings, first bucket wins,
// which failed in both directions: it rejected "melatonan" / "lipbalm" /
// "television" outright, and it mis-bucketed on accidental substrings
// ("headphones" hit the Phone bucket via "phone", "dishwasher" hit "washer",
// "backseat" hit "ac"). Both classes are fixed here:
//
//   1. Everything is TOKEN based, never raw substring, so an accidental
//      substring inside a longer word can no longer hit.
//   2. Every bucket is scored and the BEST match wins (ties to the more
//      specific key, then the earlier bucket), instead of first-in-array.
//   3. Normalization is aggressive: accents, punctuation, filler words,
//      plurals, -ing/-ed, and a shared synonym table (tv/television,
//      soda/pop/coke, bathroom/restroom/toilet) all collapse to one form.
//   4. A final fuzzy tier accepts single-character typos on longer words.
//
// Anything that still matches no bucket forms a dynamic bucket, so two players
// typing the same oddball answer continue to find each other.
// ---------------------------------------------------------------------------

// Filler stripped anywhere in the answer (never all of it — see normAnswer).
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'my', 'your', 'their', 'his', 'her', 'our', 'its', 'some', 'any',
  'to', 'i', 'you', 'im', 'it', 'of', 'on', 'in', 'at', 'for', 'and', 'or', 'with',
  'that', 'this', 'is', 'are', 'be', 'being', 'been', 'just', 'really', 'very',
  'always', 'usually', 'probably', 'definitely', 'maybe', 'like', 'about',
  'something', 'someone', 'somebody', 'anything', 'people', 'person', 'they',
  'themselves', 'yourself', 'myself', 'other', 'another', 'more', 'most', 'lot',
]);

// Multi-word forms collapsed BEFORE tokenizing, so a phrase can become one
// token (or a different phrase). Applied to guesses and alias keys alike.
const PHRASE_SYNONYMS = [
  [/\bt v\b/g, 'tv'],
  [/\bcell phone\b/g, 'phone'],
  [/\bmobile phone\b/g, 'phone'],
  [/\bsmart phone\b/g, 'phone'],
  [/\bmy phone\b/g, 'phone'],
  [/\bsocial medium\b/g, 'socialmedia'],
  [/\bsocial media\b/g, 'socialmedia'],
  [/\bice cream\b/g, 'icecream'],
  [/\blip balm\b/g, 'lipbalm'],
  [/\bchap stick\b/g, 'lipbalm'],
  [/\bair pod\b/g, 'airpod'],
  [/\bear bud\b/g, 'earbud'],
  [/\bear phone\b/g, 'earbud'],
  [/\bhead phone\b/g, 'headphone'],
  [/\bsun glass\b/g, 'sunglass'],
  [/\brest room\b/g, 'bathroom'],
  [/\bwash room\b/g, 'bathroom'],
  [/\bwash machine\b/g, 'washingmachine'],
  [/\bwashing machine\b/g, 'washingmachine'],
  [/\bdish washer\b/g, 'dishwasher'],
  [/\bremote control\b/g, 'remote'],
  [/\bair condition\w*\b/g, 'ac'],
  [/\bfast food\b/g, 'fastfood'],
  [/\bsoft drink\b/g, 'soda'],
  [/\bgas station\b/g, 'gasstation'],
  [/\bpost office\b/g, 'postoffice'],
  [/\bgrocery store\b/g, 'grocerystore'],
  [/\bdrive thru\b/g, 'drivethru'],
  [/\bdrive through\b/g, 'drivethru'],
];

// Single-token equivalences. Keys are RAW or STEMMED surface forms; values are
// the canonical STEMMED token. A value must never itself be a key (no chains —
// scripts/verify-feud.mjs asserts this).
const SYNONYMS = new Map(Object.entries({
  television: 'tv', telly: 'tv', tele: 'tv',
  cellphone: 'phone', cell: 'phone', mobile: 'phone', smartphone: 'phone',
  iphone: 'phone', android: 'phone',
  refrigerator: 'fridge', refrigerater: 'fridge', icebox: 'fridge',
  sofa: 'couch', settee: 'couch', chesterfield: 'couch',
  pop: 'soda', cola: 'soda', coke: 'soda', softdrink: 'soda',
  restroom: 'bathroom', toilet: 'bathroom', washroom: 'bathroom',
  lavatory: 'bathroom', loo: 'bathroom',
  garbage: 'trash', rubbish: 'trash',
  trainer: 'sneaker', kick: 'sneaker',
  automobile: 'car', vehicle: 'car', auto: 'car',
  film: 'movie', flick: 'movie',
  physician: 'doctor', doc: 'doctor',
  child: 'kid', children: 'kid', toddler: 'kid',
  mother: 'mom', mum: 'mom', mommy: 'mom', momma: 'mom',
  father: 'dad', daddy: 'dad', papa: 'dad',
  shop: 'store',
  holiday: 'vacation',
  lift: 'elevator',
  queue: 'line',
  petrol: 'gas',
  sweet: 'candy', lolly: 'candy',
  handbag: 'purse', pocketbook: 'purse',
  spectacle: 'glass', eyeglass: 'glass',
  cash: 'money', dough: 'money', buck: 'money',
  buddy: 'friend', pal: 'friend', mate: 'friend',
  nap: 'sleep', snooze: 'sleep',
}));

// Very light stemmer: plurals, -ing, -ed. Symmetric (applied to both sides).
function stemWord(w) {
  if (w.length <= 3) return w;
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && (w.endsWith('ses') || w.endsWith('xes') || w.endsWith('zes'))) return w.slice(0, -2);
  if (w.length > 5 && (w.endsWith('ches') || w.endsWith('shes'))) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) {
    let b = w.slice(0, -3);
    if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) b = b.slice(0, -1);
    return b;
  }
  if (w.length > 4 && w.endsWith('ed')) {
    let b = w.slice(0, -2);
    if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) b = b.slice(0, -1);
    return b;
  }
  return w;
}

function canonWord(w) {
  const s = stemWord(w);
  return SYNONYMS.get(w) || SYNONYMS.get(s) || s;
}

// Normalize one free-text answer to its canonical token string: lowercase,
// strip accents + punctuation, collapse phrase synonyms, stem, apply word
// synonyms, drop filler. Filler is only dropped when something survives, so
// an all-filler answer ("something") still forms its own bucket.
export function normAnswer(s) {
  let t = String(s == null ? '' : s).toLowerCase();
  try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* keep raw */ }
  t = t.replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  // Stem every word once so the phrase table can be written in singular form.
  t = t.split(' ').map(stemWord).join(' ');
  for (const [re, rep] of PHRASE_SYNONYMS) t = t.replace(re, rep);
  const words = t.split(' ').filter(Boolean).map(canonWord);
  const kept = words.filter((w) => !STOP_WORDS.has(w));
  return (kept.length ? kept : words).join(' ');
}

export function tokensOf(norm) {
  return String(norm || '').split(' ').filter(Boolean);
}

// Levenshtein distance, bailing out past `max`.
function editDistance(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(b.length + 1);
    cur[0] = i;
    let best = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// One typo apart? Deliberately conservative: same first letter, long enough
// that a single edit is far more likely a typo than a different word (this is
// what keeps beer/bear and chili/child out).
function fuzzyWord(a, b) {
  if (a === b) return true;
  const n = Math.min(a.length, b.length);
  if (n < 5 || a[0] !== b[0]) return false;
  if (editDistance(a, b, 1) <= 1) return true;
  return n >= 8 && editDistance(a, b, 2) <= 2;
}

// Does token array `hay` contain `needle` as a contiguous run?
function containsSeq(hay, needle) {
  if (!needle.length || needle.length > hay.length) return false;
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (hay[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

const ACCEPT_FLOOR = 40;

// How well does guess G (tokens) match key K (tokens)? 0 = no match. Tiers run
// strongest to weakest; the caller keeps the best score across all buckets, so
// a bucket with an exact match always beats one matching only by typo.
export function matchScore(G, K) {
  if (!G.length || !K.length) return 0;
  const gs = G.join(' ');
  const ks = K.join(' ');
  if (gs === ks) return 100;

  // Compound-word spacing: "lip balm" / "lipbalm", "ice cream" / "icecream".
  const gd = G.join('');
  const kd = K.join('');
  if (gd === kd) return 96;

  // The key appears inside the answer: "cold pizza slice" ⊃ "pizza".
  if (containsSeq(G, K)) return 88;
  // The answer is the front/middle of a longer key: "chinese" ⊂ "chinese food".
  if (containsSeq(K, G)) return 82;

  // Order-free bag containment, for "turn over" vs "over and turn".
  if (K.length >= 2 && K.every((t) => G.includes(t))) return 76;
  if (G.length >= 2 && G.every((t) => K.includes(t))) return 72;

  // Despaced containment, multi-token side only — a single-token key is NEVER
  // matched this way, which is exactly what stops "phone" ⊂ "headphone".
  if (K.length >= 2 && gd.includes(kd)) return 68;
  if (G.length >= 2 && kd.includes(gd) && gd.length >= 5) return 64;

  // Same head noun: "leftover pizza" / "pizza pie" both end on the subject.
  const gh = G[G.length - 1];
  const kh = K[K.length - 1];
  if (gh === kh && gh.length >= 4) return 58;

  // Typo tier. Every key token must find a near-match among the answer tokens.
  if (K.every((kt) => G.some((gt) => fuzzyWord(gt, kt)))) return 48;
  if (K.length === 1 && G.length === 1 && fuzzyWord(G[0], K[0])) return 46;
  if (gh.length >= 5 && kh.length >= 5 && fuzzyWord(gh, kh)) return 42;

  return 0;
}

// Per-prompt matcher with every bucket's keys pre-normalized once. The bucket
// LABEL is always a key too (puzzles.js documents this; the first version only
// read `k`, so a label with no matching alias could not be typed verbatim).
export function promptMatcher(prompt) {
  const buckets = (prompt.answers || []).map((b, i) => {
    const raw = [b.c, ...(b.k || [])];
    const keys = [];
    const seen = new Set();
    for (const k of raw) {
      const toks = tokensOf(normAnswer(k));
      if (!toks.length) continue;
      const sig = toks.join(' ');
      if (seen.has(sig)) continue;
      seen.add(sig);
      keys.push(toks);
    }
    return { id: 'c' + i, label: b.c, keys };
  });
  return {
    buckets,
    // The bucket id for one raw answer, or null for an empty/unusable answer.
    // Scores EVERY bucket and takes the best: ties break to the more specific
    // key (more tokens), then to the earlier bucket.
    bucketOf(raw) {
      const norm = normAnswer(raw);
      const g = tokensOf(norm);
      if (!g.length) return null;
      let bestId = null;
      let bestScore = 0;
      let bestSpec = 0;
      for (const b of buckets) {
        for (const k of b.keys) {
          const sc = matchScore(g, k);
          if (sc < ACCEPT_FLOOR) continue;
          const spec = k.length * 100 + k.join('').length;
          if (sc > bestScore || (sc === bestScore && spec > bestSpec)) {
            bestScore = sc;
            bestSpec = spec;
            bestId = b.id;
          }
        }
      }
      return bestId || ('x:' + norm);
    },
  };
}
