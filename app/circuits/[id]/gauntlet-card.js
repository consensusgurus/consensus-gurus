// The Gauntlet share card's DATA, in one place (2026-08-30).
//
// Two routes draw this card: /circuits/<id> (the landing, which is the URL
// every share button hands out) and /circuits/<id>/run. Until this file the
// run route owned the bank map privately and the landing had no card at all,
// so a shared circuit link previewed as the site's default image over the
// site's boilerplate description, which says nothing about the thing being
// shared.
//
// THE BANK MAP LIVES HERE AND NOWHERE ELSE. The run route's own comment named
// it as the third copy of the roster (RUN_GAMES and the run page's BANKS are
// the other two) and as the one with no user-visible failure when it is
// forgotten: it held five banks while the run had seven, so the card
// advertised 130 questions for a 180 question run. Two routes reading one map
// is the whole point of the file. ADDING A BANK TO THE RUN STILL MEANS ADDING
// IT HERE.
//
// Only the PUZZLES lists are imported, never questions.js: the count is the
// length of today's qids, so the megabytes of question text stay out of both
// image routes.
import { circuitKeysFor, circuitSlotFor, isRunnableCircuit, rampFor } from '@/lib/circuits';
import { DAILY_GAME_MAP } from '@/lib/daily-games';

import { PUZZLES as deepPuzzles } from '../../deep/puzzles';
import { PUZZLES as atlasPuzzles } from '../../atlas/puzzles';
import { PUZZLES as sportPuzzles } from '../../sport/puzzles';
import { PUZZLES as bizPuzzles } from '../../biz/puzzles';
import { PUZZLES as scriptPuzzles } from '../../script/puzzles';
import { PUZZLES as quotesPuzzles } from '../../quotes/puzzles';
import { PUZZLES as streakPuzzles } from '../../streak/puzzles';

const DAYS = {
  deep: deepPuzzles, atlas: atlasPuzzles, sport: sportPuzzles, biz: bizPuzzles,
  script: scriptPuzzles, quotes: quotesPuzzles, streak: streakPuzzles,
};

// Spelled, for the same reason the landing page spells it: this is the
// headline on the card, and "7 quizzes" reads as a spec sheet where "Seven"
// reads as a sentence. Keep the two in step.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten'];
export function spell(n) {
  const w = WORDS[n] || String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}

export function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function askedBy(key, today) {
  const bank = DAYS[key];
  if (!bank) return 0;
  const open = bank.filter((p) => p.live <= today);
  const day = open[open.length - 1];
  return day && Array.isArray(day.qids) ? day.qids.length : 0;
}

// Today's banks for a runnable circuit, in run order, each with the colour its
// slot carries on the ladder. The colour comes from the CANONICAL roster
// position rather than today's shuffled one, so a game keeps its colour from
// day to day. A circuit that is not runnable, or whose banks have no day
// today, returns an empty array and the caller falls back to a plain card.
export function gauntletBanks(id, today) {
  const day = today || etTodayServer();
  if (!isRunnableCircuit(id)) return [];
  return circuitKeysFor(id, day).map((k) => ({
    key: k,
    name: (DAILY_GAME_MAP[k] || {}).name || k,
    asked: askedBy(k, day),
    color: rampFor(circuitSlotFor(id, k)),
  })).filter((b) => b.asked > 0);
}

export const askedTotal = (banks) => banks.reduce((a, b) => a + (b.asked || 0), 0);
