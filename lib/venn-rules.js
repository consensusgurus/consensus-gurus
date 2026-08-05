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

export const HIDDEN = {
  animal: ['CAT','DOG','COW','OWL','BAT','APE','RAT','PIG','HEN','FOX','ANT','BEE','ELK','EWE','SOW','RAM'],
  body: ['EAR','RIB','HIP','ARM','LIP','GUM','JAW','TOE','EYE','LEG','SHIN','HEEL','CHIN','LUNG','SKIN','NECK','BONE','HAND','FOOT','KNEE','HAIR','HEAD','FACE','NOSE','BACK','PALM','NAIL','CHEST','THIGH','SPINE','WRIST','ANKLE','ELBOW','CHEEK','THUMB','TOOTH','BRAIN','HEART'],
  number: ['ONE','TWO','SIX','TEN','NINE','FOUR','FIVE'],
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
