import DailyFiveSummary from './DailyFiveSummary';
import CircuitFrame from '../circuits/CircuitFrame';

// /daily-five — a run summary. Where a run ENDS: the board for that run, then
// one abridged result per game.
//
// IT SERVES EVERY CIRCUIT (owner, 2026-08-18). The bare URL is the marquee;
// /daily-five?circuit=<id> is one of the fourteen skill circuits, narrowed by
// the same query /api/quiz/daily-combined already takes. The client reads the
// param, so this server component stays static.
//
// ON THE STAGE, with the rest of the circuit family (2026-08-31). It wore
// QuizNavHeader's masthead and stat bar and NavyFrame's re-inked site footer,
// which is the chrome every other daily surface left that day. CircuitFrame
// carries the stage cap, the register switch and the stage footer instead.
//
// NO ACCENT PASSED. Which circuit this is comes from the query string and is
// read by the CLIENT (readCircuitParam), so the server cannot know it, and a
// hue that arrived after hydration would repaint the page under the reader.
// The stage's default sky is the honest answer for a page that serves fifteen.
//
// NOINDEX, on purpose. Every word on this page is either a leaderboard that
// changes hourly or one viewer's own results, so there is nothing here for a
// search engine to rank and nothing that would still be true tomorrow. It is a
// destination reached from a run, not from a search result. The run's public
// face is the circuit's own page, which IS indexed.
export const metadata = {
  title: 'The Daily Five | Mind Loft',
  description:
    'Five daily puzzles from five different categories, played as one run and ranked on combined placement across all five.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/daily-five' },
};

export default function DailyFivePage() {
  return (
    <CircuitFrame label="Run summary">
      <DailyFiveSummary />
    </CircuitFrame>
  );
}
