// Structural gate for the Quotes bank. Run after every authoring pass:
//
//   node scripts/verify-quotes.mjs
//
// The checks themselves live in scripts/mcq-gauntlet-check.mjs, shared with
// verify-script. Everything specific to this game is the five lanes below.
//
// WHAT THIS CANNOT CHECK, and what therefore stays a human job: whether the
// person named actually said the line. A quotes bank fails through popular
// misattribution rather than through structure, so every authoring pass owes
// the bank a real sourcing review as well as this run. See the header of
// scripts/quotes-source.mjs for the list of lines banned outright.
import { QUESTIONS, QUESTION_MAP } from '../app/quotes/questions.js';
import { PUZZLES } from '../app/quotes/puzzles.js';
import { checkBank, report } from './mcq-gauntlet-check.mjs';

const LANES = ['Presidents & Politics', 'History & War', 'Science, Letters & Ideas', 'Books & Authors', 'Screen Lines'];

const EXTRA = ['president', 'presidents', 'prime', 'minister', 'general', 'admiral', 'commander',
  'senator', 'philosopher', 'physicist', 'scientist', 'poet', 'novelist', 'author', 'writer',
  'historian', 'mathematician', 'economist', 'emperor', 'king', 'queen', 'told', 'said', 'says',
  'wrote', 'writes', 'asked', 'called', 'coined', 'declared', 'announced', 'warned', 'argued',
  'remarked', 'opens', 'opened', 'ends', 'british', 'american', 'french', 'german', 'roman',
  'greek', 'russian', 'italian', 'spanish', 'soviet', 'chinese', 'address', 'speech', 'inaugural',
  'congress', 'commons', 'national'];

const r = checkBank({ QUESTIONS, QUESTION_MAP, PUZZLES, key: 'quotes', LANES, extraTemplate: EXTRA });
report(r, QUESTIONS, PUZZLES);
