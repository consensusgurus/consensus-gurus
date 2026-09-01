// The Thread matcher, shared by the client and scripts/verify-thread.mjs so
// the collision audit proves the matcher the player actually meets.
//
// A guess is normalised (lowercased, accents folded, every run of
// non-alphanumerics becomes one space) and tested against a tile's keys in
// array order; the FIRST unsolved tile that hits takes the guess. A key hits
// when:
//   * it is a single token of three characters or fewer and appears in the
//     guess as a WHOLE token (so 'go' does not fire inside "goodfellas" and
//     'up' does not fire inside "upgrade"), or
//   * it is a longer single token and appears as a substring, or
//   * it has two or more words and either appears as a substring (four or more
//     characters, so 'e t' cannot fire inside "the third") or every one of
//     its words is a whole token of the guess, in any order (the quiz
//     engine's rule).
// A tile's `anti` strings run through the same test and BLOCK the match, so
// "toy story 2" cannot credit "Toy Story". The board matches on every
// keystroke, which is why short keys are token-bound.

export function norm(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function keyHit(guessNorm, key) {
  const k = norm(key);
  if (!k) return false;
  const words = k.split(' ');
  const toks = guessNorm.split(' ');
  if (words.length === 1) {
    if (k.length <= 3) return toks.includes(k);
    return guessNorm.includes(k);
  }
  if (k.length >= 4 && guessNorm.includes(k)) return true;
  return words.every((w) => toks.includes(w));
}

export function anyKey(guessNorm, keys) {
  return (keys || []).some((k) => keyHit(guessNorm, k));
}

// The tile a normalised guess credits, or -1. `solved` is a Set of indices
// already taken; a solved tile never re-fires, which is also what lets the
// player type a sequel's title past its base title.
export function tileFor(guessNorm, tiles, solved) {
  for (let i = 0; i < tiles.length; i++) {
    if (solved && solved.has(i)) continue;
    const t = tiles[i];
    if (anyKey(guessNorm, t.keys) && !anyKey(guessNorm, t.anti)) return i;
  }
  return -1;
}

// The thread a call names, or -1. `taken` is a Set of thread indices already
// called; a wrong call names a decoy when it matches one, so the reply can
// say how many tiles the caller's idea really covers.
export function threadFor(guessNorm, threads, taken) {
  for (let i = 0; i < threads.length; i++) {
    if (taken && taken.has(i)) continue;
    if (anyKey(guessNorm, threads[i].keys)) return i;
  }
  return -1;
}
export function decoyFor(guessNorm, decoys) {
  for (const d of decoys || []) if (anyKey(guessNorm, d.keys)) return d;
  return null;
}
