import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import RunClient from './RunClient';
import { circuitById, circuitKeysFor, isMarquee, isRunnableCircuit, RUN_GAMES } from '@/lib/circuits';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { SITE_URL } from '@/lib/site';

import { PUZZLES as deepPuzzles } from '../../../deep/puzzles';
import { QUESTION_MAP as deepQuestions } from '../../../deep/questions';
import { PUZZLES as atlasPuzzles } from '../../../atlas/puzzles';
import { QUESTION_MAP as atlasQuestions } from '../../../atlas/questions';
import { PUZZLES as sportPuzzles } from '../../../sport/puzzles';
import { QUESTION_MAP as sportQuestions } from '../../../sport/questions';
import { PUZZLES as bizPuzzles } from '../../../biz/puzzles';
import { QUESTION_MAP as bizQuestions } from '../../../biz/questions';
import { PUZZLES as streakPuzzles } from '../../../streak/puzzles';
import { QUESTION_MAP as streakQuestions } from '../../../streak/questions';

// THE RUN PAGE — a circuit served as one continuous quiz.
//
// Every bank is resolved HERE, on the server, and only the picked day's
// questions for the run's own games reach the browser, exactly as each game's
// own page does it. The rest of five banks never ships.
//
// BANKS is the whole of what makes a circuit runnable: a game is playable in
// one continuous board only if its day is a list of four-choice questions in
// play order. lib/circuits' RUN_GAMES names the same five keys as plain data,
// so scripts/verify-circuits.mjs can assert a circuit flagged `run` holds only
// games this page can actually serve, without importing a page component.
//
// The tier names mirror each client's own TIER_NAMES constant. They are display
// only, they name the rung a player is on and nothing branches on them, so a
// drift here costs a label rather than a wrong question. Everything that could
// be derived is derived: the name, the tag and the colour come out of the daily
// registry, the tier size out of the day's own length (every one of these games
// ramps five tiers), so there is one copy of each of those.
const BANKS = {
  deep: { puzzles: deepPuzzles, questions: deepQuestions, tiers: ['Surface', 'Shallows', 'Midwater', 'Deep water', 'The bottom'] },
  atlas: { puzzles: atlasPuzzles, questions: atlasQuestions, tiers: ['Home ground', 'Farther out', 'Off the main roads', 'The far corners', 'Expert'] },
  sport: { puzzles: sportPuzzles, questions: sportQuestions, tiers: ['Warm-up', 'First half', 'Second half', 'Crunch time', 'Overtime'] },
  biz: { puzzles: bizPuzzles, questions: bizQuestions, tiers: ['Warm-up', 'First half', 'Second half', 'Crunch time', 'Overtime'] },
  streak: { puzzles: streakPuzzles, questions: streakQuestions, tiers: ['Warm-up', 'Easy', 'Medium', 'Hard', 'Brutal'] },
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Today's live day for one game, or null when its bank has not reached today.
// A game with no puzzle today simply drops out of the run, the same way
// circuitKeysFor drops a retired one: never assume the run is five long.
function dayFor(bank, today) {
  const open = bank.puzzles.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : null;
}

export async function generateMetadata({ params }) {
  const c = circuitById(decodeURIComponent(params.id));
  if (!c) return {};
  return {
    title: `${c.name} — Every Quiz In One Run | Mind Loft`,
    description: `${c.name} played as one long quiz. Every daily trivia gauntlet back to back, one life in each, and one scorecard at the end.`,
    alternates: { canonical: `/circuits/${c.id}/run` },
    robots: { index: false, follow: true },
    openGraph: {
      title: `${c.name} — one long quiz`,
      description: 'Every daily trivia gauntlet back to back, one life in each.',
      url: `${SITE_URL}/circuits/${c.id}/run`, type: 'website', siteName: 'Mind Loft',
    },
  };
}

export default function CircuitRunPage({ params }) {
  const id = decodeURIComponent(params.id || '');
  const circuit = circuitById(id);
  // Not a circuit, the marquee (whose roster is a daily read across every
  // category, so it is not one shape), or a circuit whose games are not all
  // question banks: there is nothing to serve as one quiz, so the landing page
  // with its ordinary hand-off is the honest destination.
  if (!circuit || isMarquee(id) || !isRunnableCircuit(id)) redirect(`/circuits/${encodeURIComponent(id || '')}`);

  const today = etTodayServer();
  const keys = circuitKeysFor(id, today).filter((k) => RUN_GAMES.includes(k) && BANKS[k]);

  const sections = [];
  for (const key of keys) {
    const bank = BANKS[key];
    const day = dayFor(bank, today);
    if (!day) continue;
    const questions = day.qids
      .map((qid) => bank.questions[qid])
      .filter(Boolean)
      .map(({ q, choices, correct, cat, tier }) => ({ q, choices, correct, cat, tier }));
    if (!questions.length) continue;
    const g = DAILY_GAME_MAP[key] || {};
    sections.push({
      key,
      name: g.name || key,
      tag: g.tag || '',
      accent: g.color || '#233a63',
      quizId: day.quizId,
      num: day.num,
      topic: day.topic || '',
      perTier: Math.max(1, Math.round(questions.length / bank.tiers.length)),
      tierNames: bank.tiers,
      questions,
    });
  }

  if (sections.length < 2) redirect(`/circuits/${encodeURIComponent(id)}`);

  const label = (() => {
    try {
      return new Date(today + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    } catch (e) { return today; }
  })();

  return (
    <Suspense fallback={null}>
      <RunClient circuitId={circuit.id} circuitName={circuit.name} dateLabel={label} sections={sections} />
    </Suspense>
  );
}
