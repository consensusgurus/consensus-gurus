import QuizStatsClient from './QuizStatsClient';

export const metadata = {
  title: 'Quiz Statistics · Source of Truths',
  description: 'Every Source of Truths quiz ranked by plays, with average scores and average time taken.',
};

export default function QuizStatsPage() {
  return <QuizStatsClient />;
}
