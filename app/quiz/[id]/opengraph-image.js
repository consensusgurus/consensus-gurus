import { QUIZZES, getQuiz } from '@/lib/quizzes'
import { renderQuizCard } from '@/lib/og-stage-cards'

export const runtime = 'nodejs'
export const alt = 'Mind Loft quiz'
export { size, contentType } from '@/lib/og-stage-cards'

// On-demand: do NOT prerender all quiz share cards at build (~1,200 quizzes x
// 2 Satori renders dominated build time). Returning [] renders each card on the
// first request and CDN-caches it; dynamicParams=true allows any quiz id.
export const dynamicParams = true
export function generateStaticParams() {
  return []
}

// The Stage's card: near-black ground, the Trivia step, one glyph. Company
// quizzes used to get a separate question card here with the company's favicon
// fetched from Google at render time; both are gone with the redesign (see
// app/quiz/[id]/share-image/route.js for why).
export default async function Image({ params }) {
  const id = decodeURIComponent(params.id)
  const quiz = getQuiz(id)
  if (!quiz) return renderQuizCard({ id, title: 'Mind Loft Quiz', blurb: '', category: 'Quiz' })
  return renderQuizCard({ id, title: quiz.title, blurb: quiz.blurb, category: quiz.category })
}
