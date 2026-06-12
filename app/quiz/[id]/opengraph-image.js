import { ImageResponse } from 'next/og'
import { QUIZZES, getQuiz } from '@/lib/quizzes'

export const runtime = 'nodejs';
export const alt = 'Source of Truths quiz'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  if (!Array.isArray(QUIZZES)) return []
  return QUIZZES.map((q) => ({ id: q.id }))
}

export default async function Image({ params }) {
  const id = decodeURIComponent(params.id)
  const quiz = getQuiz(id)

  // Load Fraunces (masthead serif) + DM Serif italic so the card matches the site.
  let frauncesData = null
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.0.20/files/fraunces-latin-900-normal.woff')
    if (res.ok) frauncesData = await res.arrayBuffer()
  } catch (e) { frauncesData = null }
  let dmData = null
  try {
    const res2 = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/dm-serif-display@5/files/dm-serif-display-latin-400-italic.woff')
    if (res2.ok) dmData = await res2.arrayBuffer()
  } catch (e) { dmData = null }
  const fonts = [
    ...(frauncesData ? [{ name: 'Fraunces', data: frauncesData, weight: 900, style: 'normal' }] : []),
    ...(dmData ? [{ name: 'DMSerif', data: dmData, weight: 400, style: 'italic' }] : []),
  ]
  const ff = frauncesData ? 'Fraunces' : 'serif'
  const dmFF = dmData ? 'DMSerif' : 'serif'

  if (!quiz) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4ead5', fontSize: 60, color: '#1a1a1a', fontFamily: ff }}>
          <div style={{ display: 'flex' }}>Source of Truths</div>
        </div>
      ),
      { ...size, fonts }
    )
  }

  // Format-agnostic card: just the topic (title) and its description (blurb).
  // No "name them all / beat the clock" framing, which did not fit the map
  // (country-clicking) or matching quizzes.
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f4ead5', padding: '52px 72px', fontFamily: ff }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 10 }}>
            <div style={{ display: 'flex', fontSize: 40, color: '#1a1a1a', fontWeight: 700, lineHeight: 1 }}>Source of Truths</div>
            <div style={{ display: 'flex', fontSize: 18, color: '#c0392b', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, paddingBottom: 6 }}>
              {(quiz.category || 'Quiz')} · Quiz
            </div>
          </div>
          <div style={{ display: 'flex', width: '100%', height: 1, background: '#1a1a1a' }} />
          <div style={{ display: 'flex', width: '100%', height: 3, background: '#c0392b', marginTop: 3 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.05, marginBottom: 22, maxWidth: '96%' }}>
            {quiz.title}
          </div>
          <div style={{ display: 'flex', fontSize: 27, fontFamily: dmFF, fontStyle: 'italic', color: '#5a5a5a', lineHeight: 1.32, maxWidth: '94%' }}>
            {quiz.blurb}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #c4b896', paddingTop: 14, fontSize: 18, color: '#5a5a5a' }}>
          <div style={{ display: 'flex' }}>A Source of Truths quiz</div>
          <div style={{ display: 'flex', color: '#c0392b', fontWeight: 600 }}>Play at sourceoftruths.com</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
