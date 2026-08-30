import { renderGauntletCard, renderQuizCard } from '@/lib/og-brand-card';
import { circuitById, isMarquee } from '@/lib/circuits';
import { gauntletBanks, askedTotal, spell, etTodayServer } from './gauntlet-card';

export const runtime = 'nodejs';
// Static per route, so it covers every circuit rather than naming one.
export const alt = 'A Mind Loft circuit: several daily puzzles played back to back as one run';
export { size, contentType } from '@/lib/og-brand-card';

// THE LANDING'S SHARE CARD (owner, 2026-08-30, "it currently defaults to main
// page view").
//
// /circuits/<id> is the URL every share button on the site hands out:
// circuitShareUrl points here, the band shares it, the landing shares it, and
// the run's own scorecard shares it. It carried an openGraph title and
// description and NO image, so every one of those shares previewed as the
// root layout's default card, which is the home page. The thing being shared
// looked like the site rather than like itself.
//
// A runnable circuit draws the ladder, the same object the run itself is drawn
// on, so a reader who follows the link meets it again. Every other circuit
// gets the ordinary quiz card with its own name and its own line, which is
// still its own card rather than the site's.
export default async function Image({ params }) {
  const id = decodeURIComponent((params && params.id) || '');
  const c = circuitById(id);
  const banks = gauntletBanks(id, etTodayServer());

  if (!banks.length) {
    return renderQuizCard({
      category: isMarquee(id) ? 'Daily' : 'Circuit',
      title: c ? (isMarquee(id) ? c.name : `The ${c.name} circuit`) : 'A Mind Loft circuit',
      blurb: (c && c.share && c.share.invite) || 'Several daily puzzles, played as one run.',
    });
  }

  return renderGauntletCard({
    title: `${spell(banks.length)} quizzes. One life each.`,
    // The landing answers "what is this", where the run card answers "you are
    // about to start". So this one says what the run is made of and the run's
    // says how it plays.
    sub: 'Every daily trivia quiz, back to back as one long run. Twenty seconds a question, and one wrong answer ends that quiz.',
    banks,
    asked: askedTotal(banks),
  });
}
