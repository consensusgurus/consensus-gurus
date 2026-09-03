import { redirect } from 'next/navigation';
import { runHref } from '@/lib/circuits';
import { DOOR_QUERY } from '@/lib/trivia-door';

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

// THE DOOR LEAVES A MARK (owner, 2026-09-03). A visitor who came in through
// this address, and only this address, is offered the rest of the site once
// their run is over: see app/circuits/TriviaDoorPop.jsx. The redirect is the
// one place that knows they came this way, so it says so in the query, and
// the run page reads it once and clears it. Nothing else on the run reads
// `via`, and the run page folds no search params, so its cache is untouched.
// The name and value are spelled in lib/trivia-door.js, which is the one place
// both ends read them from; a page file may export nothing but its page.

export default function TriviaFrontDoor() {
  redirect(`${runHref('gauntlet')}?${DOOR_QUERY}`);
}
