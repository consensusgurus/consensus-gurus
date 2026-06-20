import { QUIZZES, getQuiz } from '@/lib/quizzes'
import { renderQuizCard } from '@/lib/og-brand-card'

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
  return renderQuizCard({ title: quiz.title, blurb: quiz.blurb, category: quiz.category })
}
