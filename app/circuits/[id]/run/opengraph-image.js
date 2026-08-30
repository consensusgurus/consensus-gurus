import { renderGauntletCard, renderQuizCard } from '@/lib/og-brand-card';
import { circuitById, circuitKeysFor, circuitSlotFor, isRunnableCircuit, rampFor } from '@/lib/circuits';
import { DAILY_GAME_MAP } from '@/lib/daily-games';

import { PUZZLES as deepPuzzles } from '../../../deep/puzzles';
import { PUZZLES as atlasPuzzles } from '../../../atlas/puzzles';
import { PUZZLES as sportPuzzles } from '../../../sport/puzzles';
import { PUZZLES as bizPuzzles } from '../../../biz/puzzles';
import { PUZZLES as scriptPuzzles } from '../../../script/puzzles';
import { PUZZLES as quotesPuzzles } from '../../../quotes/puzzles';
import { PUZZLES as streakPuzzles } from '../../../streak/puzzles';

export const runtime = 'nodejs';
export const alt = 'The Trivia Gauntlet: every daily trivia quiz played back to back, one life in each, from Mind Loft';
export { size, contentType } from '@/lib/og-brand-card';

// THE RUN'S OWN SHARE CARD. Without it this page inherited the root layout's
// card, so a link to the run shared as the generic site image over the site's
// boilerplate description, which says nothing about the thing being shared.
//
// IT DRAWS THE LADDER, which is what the run itself is drawn on: one rung per
// question, grouped into the banks in run order, each block in its ramp colour
// and each rung taller than the last because the questions get harder as the
// block goes on. A reader who follows the link meets the same object again.
//
// THE QUESTION COUNT IS COUNTED, never written down. A roster change, a new
// quiz or a retirement would otherwise leave a number on the card that nothing
// else on the site agrees with, and a share card is the last place anyone would
// think to look for a stale figure. That is not hypothetical: this map held
// five banks while the run had seven, so the card advertised 130 questions for
// a 180 question run from the day Script and Quotes launched.
//
// ADDING A BANK TO THE RUN MEANS ADDING IT HERE. RUN_GAMES and the run page's
// own BANKS are the other two lists; this is the third, and it is the one with
// no user-visible failure when it is forgotten. Only the PUZZLES lists are
// imported, never the question banks: the count is the length of today's qids,
// so the megabytes of questions.js stay out of this route entirely.
const DAYS = {
  deep: deepPuzzles, atlas: atlasPuzzles, sport: sportPuzzles, biz: bizPuzzles,
  script: scriptPuzzles, quotes: quotesPuzzles, streak: streakPuzzles,
};

// Spelled, for the same reason page.js spells it: this is the headline on the
// card, and "7 trivia quizzes" reads as a spec sheet where "Seven" reads as a
// sentence. Keep the two in step.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten'];
const spell = (n) => {
  const w = WORDS[n] || String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
};

function etTodayServer() {
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

export default async function Image({ params }) {
  const id = decodeURIComponent((params && params.id) || '');
  const c = circuitById(id);
  const today = etTodayServer();
  const keys = isRunnableCircuit(id) ? circuitKeysFor(id, today) : [];

  // Only banks that actually have a day today, in run order, each with the
  // colour its slot carries on the ladder (the canonical roster position, not
  // today's shuffled one, so a game keeps its colour from day to day).
  const banks = keys.map((k) => ({
    key: k,
    name: (DAILY_GAME_MAP[k] || {}).name || k,
    asked: askedBy(k, today),
    color: rampFor(circuitSlotFor(id, k)),
  })).filter((b) => b.asked > 0);
  const asked = banks.reduce((a, b) => a + b.asked, 0);

  // A circuit with no live banks, or one that is not runnable at all, still
  // needs a card; it falls back to the ordinary quiz card rather than drawing
  // an empty ladder.
  if (!banks.length) {
    return renderQuizCard({
      category: 'Trivia',
      title: `The ${(c && c.name) || 'Run'} circuit`,
      blurb: 'Every quiz in the circuit, played back to back as one long run.',
    });
  }

  return renderGauntletCard({
    title: `${spell(banks.length)} quizzes. One life each.`,
    sub: 'Twenty seconds a question. One wrong answer ends that quiz, and the next one starts on its own.',
    banks,
    asked,
  });
}
