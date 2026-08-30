import { redirect } from 'next/navigation';
import { runHref } from '@/lib/circuits';

// /trivia — the Gauntlet's own front door (owner, 2026-08-30).
//
// The run lives at /circuits/gauntlet/run, which is an accurate address and a
// terrible one to say out loud or print. This is the short one. It forwards
// rather than rendering, so there is exactly one copy of the run and no second
// page to keep in step, and the destination comes from lib/circuits so a route
// change moves this with it.
//
// It stays out of the index for the same reason the run does: the run page is
// noindex, and a vanity URL that resolves to it should not compete with the
// circuit's own landing page in search.
export const metadata = { robots: { index: false, follow: true } };

export default function TriviaFrontDoor() {
  redirect(runHref('gauntlet'));
}
