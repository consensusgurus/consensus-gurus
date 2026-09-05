import { redirect } from 'next/navigation';
import { runHref } from '@/lib/circuits';

// /valet — the Valet Gauntlet's own front door (owner, 2026-09-05), the same
// shape as /trivia: the run lives at /circuits/valet/run, which is accurate
// and unsayable, and this is the short one. It forwards rather than renders,
// so there is exactly one copy of the run, and the destination comes from
// lib/circuits so a route change moves this with it. Out of the index for the
// reason the run is: a vanity address should not compete with the circuit's
// own landing page in search.
export const metadata = { robots: { index: false, follow: true } };

export default function ValetFrontDoor() {
  redirect(runHref('valet'));
}
