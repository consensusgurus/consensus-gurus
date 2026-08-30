// Structural gate for the Script bank. Run after every authoring pass:
//
//   node scripts/verify-script.mjs
//
// The checks themselves live in scripts/mcq-gauntlet-check.mjs, shared with
// verify-quotes: the four older gauntlet verifiers (atlas, sport, biz, streak)
// are near-copies of one another, which is exactly the drift a shared checker
// stops. Everything specific to this game is the five lanes below.
import { QUESTIONS, QUESTION_MAP } from '../app/script/questions.js';
import { PUZZLES } from '../app/script/puzzles.js';
import { checkBank, report } from './mcq-gauntlet-check.mjs';

const LANES = ['Movies', 'Television', 'Actors & Directors', 'Awards & Box Office', 'Behind the Scenes'];

// Domain filler for the same-fact warning: words too generic to make two
// questions "the same fact twice" on a film and television bank.
const EXTRA = ['directed', 'director', 'directors', 'starred', 'played', 'ceremony', 'picture',
  'academy', 'award', 'awards', 'oscar', 'best', 'won', 'wins', 'winner', 'release', 'released',
  'cinema', 'cinemas', 'studio', 'studios', 'office', 'grossing', 'gross', 'episode', 'season',
  'seasons', 'sitcom', 'drama', 'comedy', 'feature', 'animated', 'british', 'american', 'french',
  'japanese', 'italian', 'german', 'soviet', 'fictional', 'followed', 'follows', 'follow', 'opened',
  'opens', 'made', 'makes', 'shot', 'filmed', 'filming', 'scene', 'sequence', 'camera', 'sound', 'color'];

const r = checkBank({ QUESTIONS, QUESTION_MAP, PUZZLES, key: 'script', LANES, extraTemplate: EXTRA });
report(r, QUESTIONS, PUZZLES);
