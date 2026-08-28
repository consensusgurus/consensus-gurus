import { renderQuizCard } from '@/lib/og-brand-card';
import { circuitById, circuitKeysFor, isRunnableCircuit } from '@/lib/circuits';
import { DAILY_GAME_MAP } from '@/lib/daily-games';

import { PUZZLES as deepPuzzles } from '../../../deep/puzzles';
import { PUZZLES as atlasPuzzles } from '../../../atlas/puzzles';
import { PUZZLES as sportPuzzles } from '../../../sport/puzzles';
import { PUZZLES as bizPuzzles } from '../../../biz/puzzles';
import { PUZZLES as streakPuzzles } from '../../../streak/puzzles';

export const runtime = 'nodejs';
export const alt = 'A run of five daily trivia quizzes, one life in each, from Mind Loft';
export { size, contentType } from '@/lib/og-brand-card';

// THE RUN'S OWN SHARE CARD. Without it this page inherited the root layout's
// card, so a link to a five-quiz run shared as the generic site image over the
// site's boilerplate description, which says nothing about the thing being
// shared. It uses the shared quiz-card renderer, so there is no new art to
// maintain and it stays in step with every other share on the site.
//
// THE QUESTION COUNT IS COUNTED, never written down. A roster change, a new
// quiz or a retirement would otherwise leave a number on the card that nothing
// else on the site agrees with, and a share card is the last place anyone
// would think to look for a stale figure. Only the PUZZLES lists are imported,
// never the question banks: the count is the length of today's qids, so the
// megabytes of questions.js stay out of this route entirely.
const DAYS = {
  deep: deepPuzzles, atlas: atlasPuzzles, sport: sportPuzzles,
  biz: bizPuzzles, streak: streakPuzzles,
};

// Spelled, for the same reason page.js spells it: this is the headline on the
// card, and "5 trivia quizzes" reads as a spec sheet where "Five" reads as a
// sentence. Keep the two in step.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
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
  const asked = keys.reduce((a, k) => a + askedBy(k, today), 0);
  const names = keys.map((k) => (DAILY_GAME_MAP[k] || {}).name).filter(Boolean);

  return renderQuizCard({
    category: 'Trivia',
    title: asked
      ? `${spell(keys.length)} trivia quizzes. One life each.`
      : `The ${(c && c.name) || 'Run'} circuit`,
    blurb: asked
      ? `${asked} questions, twenty seconds apiece, and one wrong answer ends that quiz. Then the next one starts on its own. ${names.join(', ')}.`
      : 'Every quiz in the circuit, played back to back as one long run.',
  });
}
