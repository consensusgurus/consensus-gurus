// Shared text machinery for Redact, the daily uncover-the-article game.
// Imported by the client (app/redact/RedactClient.jsx) AND the verifier
// (scripts/verify-redact.mjs), so the tokenizer, the freebie list, and the
// normalizer can never drift between play and proof.
//
// FREEBIES are pure function words, revealed from the first second. They carry
// no information about the subject, and giving them away for free is what
// keeps the opening minutes about strategy instead of typing "the".
// Content words (everything else) start hidden and are revealed by guessing.

export const FREEBIES = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'so', 'yet',
  'of', 'in', 'on', 'to', 'at', 'by', 'as', 'for', 'with', 'from', 'into',
  'onto', 'upon', 'over', 'under', 'about', 'after', 'before', 'between',
  'during', 'through', 'against', 'among', 'within', 'without', 'toward',
  'towards', 'across', 'behind', 'beyond', 'off', 'out', 'up', 'down',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'having', 'do', 'does', 'did', 'done',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'it', 'its', 'itself', 'this', 'that', 'these', 'those', 'there', 'here',
  'he', 'him', 'his', 'she', 'her', 'hers', 'they', 'them', 'their', 'theirs',
  'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my', 'who', 'whom', 'whose',
  'which', 'what', 'when', 'where', 'why', 'how',
  'not', 'no', 'nor', 'than', 'then', 'too', 'very', 'also', 'only', 'just',
  'if', 'because', 'while', 'until', 'since', 'although', 'though', 'whether',
  'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'any', 'all', 'own', 'same', 'still', 'even', 'ever', 'never', 'now',
]);

// Lowercase, strip accents, keep letters and digits only. 'Vesuvius,' and
// 'vesuvius' normalize identically; 'Galápagos' matches 'galapagos'.
export function norm(w) {
  return String(w || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Split text into alternating word / non-word tokens, preserving everything.
// A token is { t: raw text, w: true when it is a word, n: normalized form }.
// Hyphens and apostrophes SPLIT words ("Moby-Dick" -> "moby" + "dick"), which
// is also how guesses are matched, so the two can never disagree.
export function tokenize(text) {
  const out = [];
  const re = /([A-Za-zÀ-ɏ0-9]+)|([^A-Za-zÀ-ɏ0-9]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) out.push({ t: m[1], w: true, n: norm(m[1]) });
    else out.push({ t: m[2], w: false, n: '' });
  }
  return out;
}

// The words a player must uncover to win: the title's content words (freebies
// and one-or-two-letter connectives like "da" ride along for free).
export function titleTargets(answer) {
  return tokenize(answer)
    .filter((tk) => tk.w && !FREEBIES.has(tk.n) && tk.n.length >= 3)
    .map((tk) => tk.n)
    .filter((n, i, arr) => arr.indexOf(n) === i);
}

// Whether a guess (normalized) reveals a token (normalized): exact match, or
// a trivial singular/plural fold in either direction. Deliberately narrow —
// "erupt" does not reveal "erupted"; inflection hunting is part of the game.
export function guessMatches(guessN, tokenN) {
  if (!guessN || !tokenN) return false;
  if (guessN === tokenN) return true;
  if (tokenN === guessN + 's' || tokenN === guessN + 'es') return true;
  if (guessN === tokenN + 's' || guessN === tokenN + 'es') return true;
  return false;
}
