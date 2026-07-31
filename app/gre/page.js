import ExamQuizClient from '../exams/ExamQuizClient';
import { EXAMS } from '../exams/examData';

const exam = EXAMS.gre;

export const metadata = {
  title: `${exam.label} Practice — Where Will You Get In? | Source of Truths`,
  description: exam.blurb,
  robots: { index: false, follow: false },
  alternates: { canonical: '/gre' },
};

export default function GrePage() {
  return <ExamQuizClient examKey="gre" />;
}
