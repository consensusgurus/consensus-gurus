import DailyFiveSummary from './DailyFiveSummary';
import QuizNavHeader from '../quizzes/QuizNavHeader';
import Grain from '../Grain';
import Footer from '../Footer';

// /daily-five — the Daily Five run summary. Where a run ENDS: the board for the
// day's five, then one abridged result per game.
//
// NOINDEX, on purpose. Every word on this page is either a leaderboard that
// changes hourly or one viewer's own results, so there is nothing here for a
// search engine to rank and nothing that would still be true tomorrow. It is a
// destination reached from a run, not from a search result. The run's public
// face is the console band on the home page, which IS indexed.
export const metadata = {
  title: 'The Daily Five | Mind Loft',
  description:
    'Five daily puzzles from five different categories, played as one run and ranked on combined placement across all five.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/daily-five' },
};

export default function DailyFivePage() {
  return (
    <>
      <Grain />
      <QuizNavHeader />
      <DailyFiveSummary />
      <Footer />
    </>
  );
}
