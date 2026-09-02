// The word list the rack games validate a player's words against.
//
// TWO files, and the split is the whole point:
//
//   public/tuck-dict.txt       2 to 8 letters. This is ALSO the reference
//                              corpus the bank verifiers reason over — Glyph's
//                              uniqueness proof, Venn's hidden-word census,
//                              Garble's alternate-anagram check, the Shards
//                              solver, and Tuck's own benchmark solver all read
//                              it. Widening it would silently move those
//                              proofs, so it is frozen at 2 to 8.
//   public/tuck-dict-long.txt  9 to 15 letters. Player validation ONLY, read by
//                              nothing else.
//   public/tuck-dict-extra.txt Ordinary 2 to 8 letter words the base list is
//                              MISSING. Player validation ONLY, like the long
//                              file. The base list was screened for rude words
//                              by exact match, and the screen took everyday
//                              words with it: KNOB, PAWN, HELL, DAMN, BUTT,
//                              FLANGE, ESCORT, SUCK, CRAP ... while leaving
//                              their inflections (PAWNS, DAMNED, SUCKING are
//                              all in). A player typing KNOB was told it is not
//                              a word (owner report, 2026-09-02). Adding them
//                              to the base file would move the verifiers'
//                              proofs, so they live here and the verifiers
//                              never see them. Add a word here, one per line,
//                              when a reader is refused an ordinary one.
//
// The long file exists because a 14-tile Tuck rack can spell a 9+ letter run
// and an 11-wide Babel board can hold one, and until 2026-08-09 every single
// one of them was marked invalid. That is the same hole that made the 9-letter
// slot on crux-8-9-26 unplayable: a dictionary that stops short does not reject
// unusual words, it rejects EVERY word at the lengths it does not carry.
//
// So if the long file fails to load, the returned dictionary STANDS DOWN at
// those lengths instead of calling a real word wrong. Accepting an unchecked
// long word beats rejecting every one of them.

const LONG_MIN = 1000;   // below this the long list is absent, not empty

export async function loadRackDict({ upper = false } = {}) {
  const norm = (w) => (upper ? String(w).toUpperCase() : String(w).toLowerCase());
  const [base, long, extra] = await Promise.all([
    fetch('/tuck-dict.txt').then((r) => { if (!r.ok) throw new Error('tuck-dict'); return r.text(); }),
    fetch('/tuck-dict-long.txt').then((r) => (r.ok ? r.text() : '')).catch(() => ''),
    fetch('/tuck-dict-extra.txt').then((r) => (r.ok ? r.text() : '')).catch(() => ''),
  ]);
  const set = new Set();
  for (const w of base.split('\n')) { const x = w.trim(); if (x) set.add(norm(x)); }
  for (const w of extra.split('\n')) { const x = w.trim(); if (x) set.add(norm(x)); }
  let longCount = 0;
  for (const w of long.split('\n')) { const x = w.trim(); if (x) { set.add(norm(x)); longCount++; } }
  const maxJudged = longCount >= LONG_MIN ? Infinity : 8;
  return {
    has: (w) => (String(w || '').length > maxJudged ? true : set.has(norm(w))),
    size: set.size,
    maxJudged,
  };
}
