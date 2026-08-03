// Domain move: sourceoftruths.com -> mindloftdaily.com
//
// GATED OFF until cutover. With MOVE_ACTIVE unset this returns immediately on every request,
// so the middleware is present, reviewable and testable without changing any behaviour.
// Flipping the env var is the whole cutover, which is deliberate: the risky step should be a
// setting you can revert in seconds, not a deploy.
//
// Why the redirect lives here rather than in next.config.js: it has to MINT the identity
// handoff token, which means reading the sot_vid cookie and running an HMAC. next.config
// redirects are static rules and can do neither. See lib/identity-handoff.js for why an
// anonymous player is stranded without this.

import { NextResponse } from 'next/server';
import { mintHandoff, PARAM } from '@/lib/identity-handoff';

const OLD_HOSTS = new Set(['sourceoftruths.com', 'www.sourceoftruths.com']);
const NEW_HOST = 'mindloftdaily.com';

export async function middleware(req) {
  if (process.env.MOVE_ACTIVE !== '1') return NextResponse.next();

  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  if (!OLD_HOSTS.has(host)) return NextResponse.next();

  // Path-preserving: /quiz/foo on the old domain lands on /quiz/foo, so every existing deep
  // link, share URL and backlink still resolves.
  const url = new URL(req.url);
  url.host = NEW_HOST;
  url.protocol = 'https:';
  url.port = '';

  // Hand this browser's identity over, once, so a returning anonymous player keeps their
  // streak. Absent cookie or unset secret simply means no token and a fresh start.
  const anon = req.cookies.get('sot_vid')?.value;
  if (anon) {
    try {
      const token = await mintHandoff(decodeURIComponent(anon));
      if (token) url.searchParams.set(PARAM, token);
    } catch { /* never let the handoff break the redirect itself */ }
  }

  // 308 preserves the method and, unlike 302, tells search engines the move is permanent.
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip Next internals and static assets: they are same-origin fetches that never need
  // redirecting, and matching them would add latency to every asset on every page.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$).*)'],
};
