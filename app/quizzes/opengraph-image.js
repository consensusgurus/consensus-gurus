import { QUIZZES } from '@/lib/quizzes'
import { renderQuizzesCard } from '@/lib/og-stage-cards'

export const runtime = 'nodejs';
// Regenerate hourly so the count tracks the catalogue.
export const revalidate = 3600;

export const alt = 'Mind Loft quizzes: sharpen your mind'
export { size, contentType } from '@/lib/og-stage-cards'

// This route used to carry its own copy of the Loft chrome — its own
// iconRingsDataURI, its own woff fetch, its own header rules — plus three
// hard-coded sample quiz titles that nothing kept in step with the catalogue.
// All of it is the shared renderer now.
export default async function Image() {
  return renderQuizzesCard((QUIZZES || []).length)
}
