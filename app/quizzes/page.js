import QuizHomeClient from './QuizHomeClient';

export const metadata = {
  title: 'Quizzes | Source of Truths',
  description: 'Timed name-them-all quizzes built from the ranked consensus behind Source of Truths lists, from top-grossing films and songs to best-selling games, cars, and more.',
  alternates: { canonical: '/quizzes' },
};

export default function QuizzesPage() {
  return <QuizHomeClient />;
}
