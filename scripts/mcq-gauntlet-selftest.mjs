// scripts/mcq-gauntlet-selftest.mjs — proves the gauntlet bank checks FIRE.
//
// A check that has never gone red has not been tested. The 2026-09-04 restock
// shipped 72 British spellings past checkers that were all green, because none
// of them was looking, and "green" is indistinguishable from "not looking"
// unless something has watched the check fail on purpose.
//
// This feeds checkBank a synthetic day that is at the copy floor and violates
// one new rule at a time, and asserts the matching error comes back. It does
// NOT assert the day is otherwise valid: the ramp, lane cycle and column checks
// will also complain, and that is irrelevant here.
//
//   node scripts/mcq-gauntlet-selftest.mjs
import { checkBank } from './mcq-gauntlet-check.mjs';

const LANES = ['Presidents & Politics', 'History & War', 'Science, Letters & Ideas', 'Books & Authors', 'Screen Lines'];
const LIVE = '2026-09-29';

// One well-formed question, which each case then bends.
const base = (over = {}) => ({
  id: 'd031q01', cat: 'Presidents & Politics', tier: 1,
  q: 'Which president warned against the military industrial complex?',
  choices: ['Dwight D. Eisenhower', 'Harry S. Truman', 'John F. Kennedy', 'Richard Nixon'],
  correct: 0, ...over,
});

const runOne = (questions, opts) => {
  const QUESTIONS = questions;
  const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
  const PUZZLES = [{ num: 31, quizId: 'quotes-9-29-26', live: LIVE, dateLabel: 'September 29, 2026', qids: QUESTIONS.map((q) => q.id) }];
  return checkBank({ QUESTIONS, QUESTION_MAP, PUZZLES, key: 'quotes', LANES, copyFrom: LIVE, ...opts }).errs;
};

const CASES = [
  {
    name: 'US spellings in a choice',
    questions: [base({ choices: ['The Labour of Hercules', 'A', 'B', 'C'], q: 'Which travelling salesman story is set in a theatre?' })],
    opts: {},
    want: /British form/,
  },
  {
    name: 'an answer over the reuse cap',
    questions: Array.from({ length: 5 }, (_, i) => base({ id: `d031q0${i + 1}`, q: `Which president said thing number ${i + 1}?` })),
    opts: { answerCap: 4 },
    want: /over the 4-use cap/,
  },
  {
    name: 'a Screen Lines stem that does not ask as a character',
    questions: [base({ cat: 'Screen Lines', q: 'Who says here is looking at you kid in Casablanca?', choices: ['Rick Blaine', 'Ilsa Lund', 'Victor Laszlo', 'Captain Renault'] })],
    opts: { laneStem: { 'Screen Lines': { re: /\bcharacters?\b/i, why: 'must ask as a character' } } },
    want: /must ask as a character/,
  },
  {
    name: 'a banned apocryphal attribution',
    questions: [base({ q: 'Who dismissed the starving with let them eat cake?', choices: ['Marie Antoinette', 'Louis XVI', 'Madame de Pompadour', 'Robespierre'] })],
    opts: { bannedPairs: [{ who: /marie antoinette/i, what: /\bcake\b/i, why: 'Marie Antoinette never said let them eat cake' }] },
    want: /never said let them eat cake/,
  },
  {
    name: 'the SAME banned line asked honestly, which must NOT fail',
    questions: [base({ q: 'Which line is wrongly attributed to Marie Antoinette, who never said it about cake?', choices: ['Let them eat cake', 'Marie Antoinette', 'Louis XVI', 'Robespierre'] })],
    opts: { bannedPairs: [{ who: /marie antoinette/i, what: /\bcake\b/i, why: 'Marie Antoinette never said let them eat cake' }] },
    wantNot: /never said let them eat cake/,
  },
];

let bad = 0;
for (const c of CASES) {
  const errs = runOne(c.questions, c.opts);
  const hit = errs.some((e) => (c.want || c.wantNot).test(e));
  const ok = c.want ? hit : !hit;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${c.name}`);
  if (!ok) console.log(`    errors were: ${errs.join(' | ') || '(none)'}`);
}
console.log(bad ? `\n${bad} check(s) did not behave as claimed.` : '\nEvery gauntlet bank check fires when it should, and stays quiet when it should not.');
process.exit(bad ? 1 : 0);
