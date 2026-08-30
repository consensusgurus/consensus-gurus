import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import RunClient from './RunClient';
import { circuitById, circuitGamesFor, circuitKeysFor, isMarquee, isRunnableCircuit, RUN_GAMES } from '@/lib/circuits';
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
import { PUZZLES as scriptPuzzles } from '../../../script/puzzles';
import { QUESTION_MAP as scriptQuestions } from '../../../script/questions';
import { PUZZLES as quotesPuzzles } from '../../../quotes/puzzles';
import { QUESTION_MAP as quotesQuestions } from '../../../quotes/questions';
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
  script: { puzzles: scriptPuzzles, questions: scriptQuestions, tiers: ['Opening credits', 'First act', 'Second act', 'Third act', 'The credits roll'] },
  quotes: { puzzles: quotesPuzzles, questions: quotesQuestions, tiers: ['Household words', 'Well known', 'Worth knowing', 'For the reader', 'Chapter and verse'] },
  biz: { puzzles: bizPuzzles, questions: bizQuestions, tiers: ['Warm-up', 'First half', 'Second half', 'Crunch time', 'Overtime'] },
  streak: { puzzles: streakPuzzles, questions: streakQuestions, tiers: ['Warm-up', 'Easy', 'Medium', 'Hard', 'Brutal'] },
};

export const dynamic = 'force-dynamic';

// The house voice SPELLS a small count ("Twenty-five questions, one life"), and
// this is the most visible string on the page, so "Five trivia quizzes" rather
// than "5". Falls back to the numeral above seven, where spelling stops helping.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const spell = (n, cap = false) => {
  const w = WORDS[n] || String(n);
  return cap ? w.charAt(0).toUpperCase() + w.slice(1) : w;
};

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

// THE SHARE COPY. This link is meant to be sent to somebody who has never
// played, so every string here is written for a cold reader rather than for
// somebody already on the site.
//
// STAKES FIRST, and the twitter block is stated in full. A page that names no
// twitter card inherits the ROOT layout's, which is the site boilerplate about
// 1,000+ quizzes and 669 experts: true of the site, and nothing at all to do
// with the thing being shared. That is what this page was doing.
//
// NO COMPETITOR MARK. The obvious line here is the name of a certain television
// quiz show, and it is deliberately not used: the house rule is that a rival
// game's trademark never appears in user-facing copy or metadata (the same
// reason nothing on the site names Wordle, Connections or Jumble), and a quiz
// product is exactly where such a mark gets enforced. "Quiz show practice"
// carries the same meaning and belongs to us. Do not swap it back.
//
// NOTHING HERE CLAIMS A NUMBER WE HAVE NOT MEASURED. No "most players are out
// by question ten": it reads well and we have not counted it. The stakes are
// carried by what the game actually does, which is enough.
export async function generateMetadata({ params }) {
  const c = circuitById(decodeURIComponent(params.id));
  if (!c) return {};
  const games = circuitGamesFor(c.id, etTodayServer()).filter((g) => RUN_GAMES.includes(g.key));
  const n = games.length || 5;
  const url = `${SITE_URL}/circuits/${c.id}/run`;
  const hook = `${spell(n, true)} trivia quizzes. One life each.`;
  return {
    title: `${c.name} — ${spell(n, true)} Trivia Quizzes, One Long Run | Mind Loft`,
    description:
      `Quiz show practice, ${spell(n)} rounds deep. Every daily trivia quiz played back to back as one run: a topic in depth, the whole map, every sport, the business of everything, and forty questions of anything at all. Twenty seconds a question, one life in each quiz, and one wrong answer ends it. Free, no signup, new questions every day.`,
    alternates: { canonical: `/circuits/${c.id}/run` },
    robots: { index: false, follow: true },
    openGraph: {
      title: hook,
      description:
        'Quiz show practice with the stakes left in. One wrong answer ends that quiz, the next one starts on its own, and you get one scorecard at the end.',
      url, type: 'website', siteName: 'Mind Loft',
    },
    twitter: {
      card: 'summary_large_image',
      title: hook,
      description: 'One wrong answer ends the quiz. Then the next one starts. How far do you get?',
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
      // The one line under the name, on the start list AND the scorecard: the
      // game's SUBJECT, never its day topic and never its question count. See
      // the note on `subject` in lib/daily-games.js.
      subject: g.subject || g.cat || '',
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
