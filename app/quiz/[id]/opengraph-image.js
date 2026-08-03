import { QUIZZES, getQuiz } from '@/lib/quizzes'
import { renderQuizCard, renderQuizQuestionCard } from '@/lib/og-brand-card'
import { companyDomainForQuiz } from '@/lib/company-quiz-meta'

export const runtime = 'nodejs'
export const alt = 'Mind Loft quiz'
export { size, contentType } from '@/lib/og-brand-card'

// On-demand: do NOT prerender all quiz share cards at build (~1,200 quizzes x
// 2 Satori renders dominated build time). Returning [] renders each card on the
// first request and CDN-caches it; dynamicParams=true allows any quiz id.
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

// Rebranded share card (Manrope, near-white, blue/gold logo) — matches the
// homepage brand card instead of the old cream/red Fraunces format.
export default async function Image({ params }) {
  const id = decodeURIComponent(params.id)
  const quiz = getQuiz(id)
  if (!quiz) return renderQuizCard({ title: 'Mind Loft Quiz', blurb: '', category: 'Quiz' })
  if (quiz.category === 'Business' && quiz.format === 'timed-mcq' && Array.isArray(quiz.questions) && quiz.questions.length) {
    return renderQuizQuestionCard({ title: quiz.title, category: quiz.category, question: quiz.questions[0], qIndex: 1, total: quiz.questions.length, id, faviconDomain: companyDomainForQuiz(id) })
  }
  return renderQuizCard({ title: quiz.title, blurb: quiz.blurb, category: quiz.category })
}
