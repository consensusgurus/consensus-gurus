// Domain move: sourceoftruths.com / consensusgurus.com -> mindloftdaily.com
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
//
// Why every old host is listed here rather than pointed at another old host in Vercel:
// a Vercel domain-level "Redirect to" fires at the edge BEFORE this middleware, so such a
// host never mints a handoff token, and it costs an extra hop. Two hops also broke Google's
// Change of Address validator, which wants the old homepage to reach the new one directly
// (2026-08-05: consensusgurus.com -> sourceoftruths.com -> mindloftdaily.com failed with
// "couldn't fetch the page"). So every old host is set to Production in Vercel and lands
// here, giving exactly ONE 308 to the new host, carrying the handoff.

import { NextResponse } from 'next/server';
import { mintHandoff, PARAM } from '@/lib/identity-handoff';
import { SOT_PATHS } from '@/lib/site';

const OLD_HOSTS = new Set([
  'sourceoftruths.com',
  'www.sourceoftruths.com',
  'consensusgurus.com',
  'www.consensusgurus.com',
]);
const NEW_HOST = 'mindloftdaily.com';

export async function middleware(req) {
  if (process.env.MOVE_ACTIVE !== '1') return NextResponse.next();

  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  if (!OLD_HOSTS.has(host)) return NextResponse.next();

  const url = new URL(req.url);

  // The one path on an old host that must NOT redirect. Google needs to read a sitemap of
  // the OLD urls to discover the redirects quickly, and a sitemap that redirects away hands
  // it the new urls it already has. app/legacy-sitemap emits this host's own urls, so the
  // old property in Search Console keeps a sitemap that is actually in scope for it.
  if (url.pathname === '/sitemap.xml') {
    url.pathname = '/legacy-sitemap';
    url.searchParams.set('host', host);
    return NextResponse.rewrite(url);
  }

  // The Sports Ranking pages are a Source of Truths property and are canonical on THIS host
  // (owner decision, 2026-08-28), so they are served here rather than redirected away. Their
  // canonical and sitemap entries both point at this host, so the two signals agree. Every
  // other PAGE on every old host still 308s, exactly as before.
  if (SOT_PATHS.includes(url.pathname)) return NextResponse.next();

  // ...and so must the API, or those pages are broken on this host. A 308 to another origin
  // is not a redirect a browser follows for an XHR: it comes back as an opaqueredirect and
  // the call fails. Measured 2026-08-28, that silently killed the view beacon and the footer's
  // visitor count on sourceoftruths.com. API routes are not an SEO surface and are served by
  // this same deployment against the same database, so serving them here costs nothing and
  // redirecting them costs a broken page.
  if (url.pathname.startsWith('/api/')) return NextResponse.next();

  // Path-preserving: /quiz/foo on the old domain lands on /quiz/foo, so every existing deep
  // link, share URL and backlink still resolves.
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
  matcher: [
    // Skip Next internals and static assets: they are same-origin fetches that never need
    // redirecting, and matching them would add latency to every asset on every page. This
    // pattern also excludes .xml, which is why /sitemap.xml is listed separately below.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|txt|xml)$).*)',
    '/sitemap.xml',
  ],
};
