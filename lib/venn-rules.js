// The Venn rule engine — the single definition of what each rule means.
//
// This used to exist twice, byte-identical, in app/venn/VennClient.jsx and
// scripts/verify-venn.mjs, with a comment asking future editors to keep them
// in sync by hand. Both now import from here, so the verifier and the browser
// cannot disagree about an item's region even in principle.
//
// A rule is DATA ({ k: 'dbl' }, { k: 'len', n: 5 }, { k: 'fact', p: 'euro' }).
// No board ever stores where its items go: the client recomputes each region
// from these functions, exactly as the verifier does, so opening the bundle
// tells a player nothing.
//
// Two families of rule:
//   ORTHOGRAPHIC — a property of the string. Always true or false, never
//     arguable, computable from the item alone.
//   KNOWLEDGE (`fact`) — a property of the thing the item names, looked up in
//     a closed table in lib/venn-facts.js. The board must declare its
//     `domain`, and every item must be a row in that domain's table.
//
// Letter rules normalise first: LETTERS('NEW YORK') is 'NEWYORK', so a
// two-word entity counts seven letters, not eight, and the space never reads
// as a repeated character. Every existing board is pure A-Z, so this changes
// nothing about the 68 boards that predate it.

import { DOMAINS, hasFact, factLabel } from './venn-facts.js';

export const VOW = new Set(['A', 'E', 'I', 'O', 'U']);
export const LETTERS = (w) => w.replace(/[^A-Z]/g, '');
const nv = (w) => [...LETTERS(w)].filter((c) => VOW.has(c)).length;

// The member lists. These used to be HALF the story: a second, hand-written
// DECOY list lived in scripts/verify-venn.mjs holding real members these lists
// omitted, and a board carrying one failed. Two hand lists with the same job
// meant a word could be missing from BOTH and ship — which is exactly how
// WOMBAT reached the August 6 2026 board under "hides a body part" while WOMB
// scored nothing. The decoy list has been folded in here, so there is now ONE
// list per category and anything on it SCORES. What stops the next omission is
// no longer a second list but the census gate in scripts/verify-venn.mjs: every
// real English word hidden inside an item must be either a member below or a
// word explicitly recorded as not-a-member in scripts/venn-hidden-review.mjs.
// An unclassified word fails the board, so silence can no longer pass.
//
// Adding a member here therefore WIDENS the circle and can move items between
// regions on existing boards. Re-run the verifier over the whole bank after any
// edit; it recomputes every region from scratch and will say what broke.
export const HIDDEN = {
  animal: [
    'ANT','APE','ASS','BAT','BEE','CAT','COD','COW','CUB','DOE','DOG','EEL','ELK','EMU','EWE',
    'FOX','GNU','HEN','KID','OWL','PIG','PUP','RAM','RAT','RAY','SOW','YAK','BASS','BEAR',
    'BOAR','BULL','CALF','CARP','CLAM','COLT','CRAB','CROW','DEER','DOVE','DUCK','FOAL','FROG',
    'GOAT','HARE','HAWK','LAMB','LARK','LION','MARE','MOLE','MOTH','MULE','ORCA','PIKE','SEAL',
    'SLUG','SOLE','SWAN','TOAD','TUNA','WOLF','WORM','WREN','BISON','CAMEL','GOOSE','HORSE',
    'HYENA','KOALA','LLAMA','MOOSE','MOUSE','OTTER','PANDA','RAVEN','RHINO','ROBIN','SHARK',
    'SHEEP','SKUNK','SLOTH','SNAIL','SNAKE','SQUID','STOAT','TIGER','TROUT','WHALE','ZEBRA',
    'BADGER','BEAVER','FERRET','LOCUST','MONKEY','RABBIT','SALMON','SPIDER','TURTLE','WEASEL',
  ],
  body: [
    'ARM','EAR','EYE','GUM','GUT','HIP','JAW','LEG','LIP','PEC','RIB','TOE','BACK','BONE',
    'CHIN','FACE','FOOT','HAIR','HAND','HEAD','HEEL','KNEE','LUNG','NAIL','NECK','NOSE','PALM',
    'SHIN','SKIN','VEIN','WOMB','ANKLE','BRAIN','CHEEK','CHEST','ELBOW','HEART','LIVER','SCALP',
    'SPINE','THIGH','THUMB','TOOTH','TORSO','WAIST','WRIST','EYELID','FINGER','KIDNEY','MUSCLE',
    'PELVIS','TEMPLE','THROAT','TONGUE','STOMACH','SHOULDER',
  ],
  number: [
    'ONE','SIX','TEN','TWO','FIVE','FOUR','NINE','ZERO','EIGHT','FIFTY','FORTY','SEVEN','SIXTY',
    'THREE','ELEVEN','NINETY','TWELVE','TWENTY','HUNDRED','MILLION',
  ],
};
export const HIDDEN_NAME = { animal: 'an animal', body: 'a body part', number: 'a number' };

// A word only HIDES something when the smaller word sits inside a LONGER one.
// LUNG does not hide a lung and EYES does not hide an eye: an item that IS the
// hidden word, or merely its plural, hides nothing. HEART still qualifies,
// because a heart hides an EAR.
export const hides = (w, h) => w.includes(h) && w !== h && w !== `${h}S` && w !== `${h}ES`;

const NUMWORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

// `domain` is only consulted by the `fact` rule; every other rule ignores it.
export function ruleFn(r, domain) {
  switch (r.k) {
    case 'alpha': return (w) => [...LETTERS(w)].every((c, i, a) => i === 0 || c >= a[i-1]);
    case 'norepeat': return (w) => new Set(LETTERS(w)).size === LETTERS(w).length;
    case 'dbl': return (w) => /(.)\1/.test(LETTERS(w));
    case 'len': return (w) => LETTERS(w).length === r.n;
    case 'lenGte': return (w) => LETTERS(w).length >= r.n;
    case 'vowels': return (w) => nv(w) === r.n;
    case 'onevowel': return (w) => new Set([...LETTERS(w)].filter((c) => VOW.has(c))).size === 1;
    case 'sameends': return (w) => LETTERS(w)[0] === LETTERS(w)[LETTERS(w).length-1];
    case 'startvowel': return (w) => VOW.has(LETTERS(w)[0]);
    case 'endvowel': return (w) => VOW.has(LETTERS(w)[LETTERS(w).length-1]);
    case 'altvc': return (w) => [...LETTERS(w)].every((c, i, a) => i === 0 || VOW.has(c) !== VOW.has(a[i-1]));
    case 'twinvowel': return (w) => [...LETTERS(w)].some((c, i, a) => i > 0 && VOW.has(c) && VOW.has(a[i-1]));
    case 'nolet': return (w) => !LETTERS(w).includes(r.c);
    case 'hides': return (w) => HIDDEN[r.set].some((h) => hides(LETTERS(w), h));
    case 'fact': return (w) => hasFact(domain, w, r.p);
    default: return null;
  }
}

export function ruleLabel(r, domain) {
  switch (r.k) {
    case 'alpha': return 'letters never go backwards';
    case 'norepeat': return 'no repeated letter';
    case 'dbl': return 'has a double letter';
    case 'len': return `exactly ${NUMWORD[r.n]} letters`;
    case 'lenGte': return `${NUMWORD[r.n]} letters or more`;
    case 'vowels': return `exactly ${NUMWORD[r.n]} vowels`;
    case 'onevowel': return 'only one distinct vowel';
    case 'sameends': return 'starts and ends alike';
    case 'startvowel': return 'starts with a vowel';
    case 'endvowel': return 'ends with a vowel';
    case 'altvc': return 'vowels and consonants alternate';
    case 'twinvowel': return 'two vowels side by side';
    case 'nolet': return `no letter ${r.c}`;
    case 'hides': return `hides ${HIDDEN_NAME[r.set]}`;
    case 'fact': return factLabel(domain, r.p);
    default: return 'unknown';
  }
}

export const isFactRule = (r) => r.k === 'fact';
export const usesFacts = (rules) => rules.some(isFactRule);
export { DOMAINS };
