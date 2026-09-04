import { CONTEST } from '@/lib/contest'
import { renderContestCard } from '@/lib/og-stage-cards'

export const runtime = 'nodejs'
// Days-left is derived at request time, so the card cannot go stale mid-contest.
export const revalidate = 3600

export const alt = `Win ${CONTEST.prizeLabel}: the Mind Loft referral contest`
export { size, contentType } from '@/lib/og-stage-cards'

// This route used to carry its own copy of the Loft chrome, its own mark, and its
// own jsdelivr font fetch, which is why it was one of the four image routes that
// 500 whenever that CDN is unreachable. The shared renderer reads its fonts from
// node_modules, so the card cannot fail on a network hiccup.
export default async function Image() {
  const left = Math.max(0, Math.ceil((Date.parse(CONTEST.endsAt) - Date.now()) / 86400000))
  return renderContestCard({
    prizeLabel: CONTEST.prizeLabel,
    prizes: CONTEST.prizes,
    deadlineLabel: CONTEST.deadlineLabel,
    daysLeft: left,
  })
}
