import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { parseUa, countryFromRequest, regionFromRequest, cityFromRequest, referrerHost, INTERNAL_HOST } from '@/lib/ua';
import { normalizeCampaign } from '@/lib/campaigns';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Crawlers and link-preview fetchers hit a QR landing URL too (a code posted to
// social gets unfurled). They are logged, not dropped, but flagged so the admin
// can read a clean human number.
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|embedly|curl|wget|python-requests|headless/i;

// POST /api/campaign  { campaign, path?, referrer? }
// Records ONE landing on a campaign link (?c=<code>) — the scan itself. A
// person who scans a printed QR and reads nothing still counts here, which is
// the point: it separates "the ad got attention" from "the puzzle held them".
//
// Best-effort throughout. A campaign_hits table that has not been created yet
// (migration 40) fails silently rather than erroring on the visitor's first
// paint, so this route is safe to deploy ahead of the migration.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const campaign = normalizeCampaign(body.campaign);
    if (!campaign) {
      return NextResponse.json({ error: 'campaign required' }, { status: 400 });
    }

    const ua = parseUa(request.headers.get('user-agent'));
    const uaRaw = request.headers.get('user-agent') || '';
    const path = typeof body.path === 'string' ? body.path.slice(0, 200) : null;
    // The browser's own document.referrer, not the request's Referer header
    // (which is just the landing page itself). A QR scan normally has none,
    // which is itself a useful signal that the traffic came from print.
    let referrer = null;
    if (typeof body.referrer === 'string' && body.referrer.trim()) {
      const h = referrerHost(body.referrer);
      referrer = h ? (INTERNAL_HOST.test(h) ? 'internal' : h) : null;
    }

    const row = {
      campaign,
      path,
      visitor_id: request.cookies.get('sot_vid')?.value?.slice(0, 64) || null,
      referrer_host: referrer,
      country: countryFromRequest(request) || null,
      region: regionFromRequest(request) || null,
      city: cityFromRequest(request) || null,
      ua_browser: ua.browser || null,
      ua_os: ua.os || null,
      is_mobile: ua.isMobile ?? null,
      is_bot: BOT_RE.test(uaRaw),
    };

    const { error } = await supabaseAdmin.from('campaign_hits').insert(row);
    // Every landing is stored raw; the once-per-browser-per-day de-duplication
    // happens at read time in /admin/campaigns (migration 40 explains why it
    // cannot be a unique index). Errors are logged and swallowed: a landing must
    // never fail because analytics did.
    if (error && error.code !== '23505') {
      console.error('campaign_hits insert error', error);
    }

    // Mirror the cookie server-side so attribution survives a browser that
    // blocks document.cookie writes from script but accepts Set-Cookie.
    const res = NextResponse.json({ ok: true });
    res.cookies.set('sot_camp', campaign, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
