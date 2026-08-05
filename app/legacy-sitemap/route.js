// The OLD hosts' sitemap, served at <old-host>/sitemap.xml via a rewrite in middleware.js.
//
// Why this exists. At cutover SITE_URL moved, so app/sitemap.js began emitting
// mindloftdaily.com urls for every host and sourceoftruths.com/sitemap.xml started
// advertising the NEW urls. That is the wrong job for an old host's sitemap on two counts:
// the sourceoftruths property in Search Console gets a sitemap full of urls outside its own
// scope, and Google loses the fastest way to learn that the ~2.4k OLD urls now 308. Google's
// site-move guidance is the opposite of what we were doing: keep the old sitemap listing the
// OLD urls, with lastmod set to the move, so Googlebot recrawls them and sees the redirects
// rather than rediscovering each one on its own schedule.
//
// The url set comes from lib/sitemap-entries.js, the same generator app/sitemap.js uses, so
// this can never drift from the real sitemap: add a page there and it appears in both.
//
// lastmod is the CUTOVER MOMENT, fixed, never Date.now(). A lastmod that moves on every
// request is exactly the fake churn that teaches Google to ignore the field, the same reason
// app/sitemap.js uses real publish dates rather than build time. Aug 4 is honest here: that
// is the day these urls changed, from pages into permanent redirects.
//
// Temporary by design. Six months on, the redirects have been recrawled and a sitemap of
// nothing but redirects is noise, so it retires itself at RETIRE_AFTER. After that date this
// file and the middleware branch that rewrites to it can both be deleted.

import { sitemapEntries } from '@/lib/sitemap-entries';

const CUTOVER = '2026-08-04T00:00:00.000Z';
const RETIRE_AFTER = Date.parse('2027-02-04T00:00:00.000Z');

const LEGACY_HOSTS = new Set([
  'sourceoftruths.com',
  'www.sourceoftruths.com',
  'consensusgurus.com',
  'www.consensusgurus.com',
]);

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const dynamic = 'force-dynamic';

export function GET(request) {
  if (Date.now() >= RETIRE_AFTER) {
    return new Response('Gone', { status: 410 });
  }

  // Set by the middleware rewrite. Falls back to the Host header, then to the primary old
  // host, so a direct hit on /legacy-sitemap still returns something coherent.
  const requested = new URL(request.url).searchParams.get('host');
  const header = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const host = LEGACY_HOSTS.has(requested)
    ? requested
    : LEGACY_HOSTS.has(header)
      ? header
      : 'sourceoftruths.com';

  const body = sitemapEntries(`https://${host}`)
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${CUTOVER}</lastmod>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Long enough that Googlebot's fetches are cheap, short enough that a page added today
      // shows up on the old sitemap tomorrow, matching the real sitemap's daily cadence.
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
