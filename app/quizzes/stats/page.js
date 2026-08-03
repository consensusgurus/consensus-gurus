import QuizStatsClient from './QuizStatsClient';

export const metadata = {
  title: 'Quiz Statistics · Mind Loft',
  description: 'Every Mind Loft quiz ranked by plays, with average scores and average time taken.',
};

export default function QuizStatsPage() {
  return <QuizStatsClient />;
}
