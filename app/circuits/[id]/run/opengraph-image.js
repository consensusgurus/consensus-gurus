import { renderGauntletCard, renderQuizCard } from '@/lib/og-brand-card';
import { circuitById } from '@/lib/circuits';
import { gauntletBanks, askedTotal, spell, etTodayServer } from '../gauntlet-card';

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
// think to look for a stale figure. That is not hypothetical: the bank map held
// five banks while the run had seven, so the card advertised 130 questions for
// a 180 question run from the day Script and Quotes launched.
//
// THE MAP ITSELF MOVED to ../gauntlet-card (2026-08-30), because the landing
// page's card needs exactly the same counts and a second private copy is how
// the stale figure above happened in the first place. Adding a bank to the run
// still means adding it there.
export default async function Image({ params }) {
  const id = decodeURIComponent((params && params.id) || '');
  const c = circuitById(id);
  const banks = gauntletBanks(id, etTodayServer());

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
    asked: askedTotal(banks),
  });
}
