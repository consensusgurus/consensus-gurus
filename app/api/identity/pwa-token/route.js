// Mints a LONG-LIVED identity handoff token for the PWA install path.
//
// WHY: an iOS home-screen web app runs in its own storage partition, with different
// localStorage AND cookies from Safari, so installing the site used to sign the player out
// with no way back (a name-only account cannot rejoin: username_taken is a dead end). The
// only channel that crosses the partition is the URL baked into the manifest's start_url.
// VisitorBeacon fetches a token here and points the page's manifest link at
// /api/pwa-manifest?_ml=<token>, which echoes the token into start_url; the installed app's
// first launch then claims it through the same /api/identity/claim flow the domain move
// used, restoring both the anon history and the signed-in identity.
//
// TTL is 60 days (vs the redirect handoff's 5 minutes) because the token is frozen into the
// home-screen entry at install time and the first launch can come much later. adoptable()
// still gates the claim client-side, so the token is only honored by a browser context with
// no history of its own; later launches from the same icon are no-ops.
import { NextResponse } from 'next/server';
import { mintHandoff, PWA_TTL_MS } from '@/lib/identity-handoff';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const anon = req.cookies.get('sot_vid')?.value;
  if (!anon) return NextResponse.json({ ok: false }, { status: 400 });
  let token = null;
  try { token = await mintHandoff(decodeURIComponent(anon), undefined, PWA_TTL_MS); } catch (e) { /* fall through */ }
  if (!token) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json(
    { ok: true, token, exp: Date.now() + PWA_TTL_MS },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
