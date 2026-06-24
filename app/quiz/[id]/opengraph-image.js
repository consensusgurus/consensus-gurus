import { QUIZZES, getQuiz } from '@/lib/quizzes'
import { renderQuizCard, renderQuizQuestionCard } from '@/lib/og-brand-card'
import { companyDomainForQuiz } from '@/lib/company-quiz-meta'

export const runtime = 'nodejs'
export const alt = 'Source of Truths quiz'
export { size, contentType } from '@/lib/og-brand-card'

export function generateStaticParams() {
  if (!Array.isArray(QUIZZES)) return []
  return QUIZZES.map((q) => ({ id: q.id }))
}

// Rebranded share card (Manrope, near-white, blue/gold logo) — matches the
// homepage brand card instead of the old cream/red Fraunces format.
export default async function Image({ params }) {
  const id = decodeURIComponent(params.id)
  const quiz = getQuiz(id)
  if (!quiz) return renderQuizCard({ title: 'Source of Truths Quiz', blurb: '', category: 'Quiz' })
  if (quiz.category === 'Business' && quiz.format === 'timed-mcq' && Array.isArray(quiz.questions) && quiz.questions.length) {
    return renderQuizQuestionCard({ title: quiz.title, category: quiz.category, question: quiz.questions[0], qIndex: 1, total: quiz.questions.length, id, faviconDomain: companyDomainForQuiz(id) })
  }
  return renderQuizCard({ title: quiz.title, blurb: quiz.blurb, category: quiz.category })
}
