import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isbot } from 'isbot';
import {
  parseUa,
  countryFromRequest,
  regionFromRequest,
  cityFromRequest,
  referrerHost,
  classifyChannel,
} from '@/lib/ua';

export const dynamic = 'force-dynamic';

// A missing-column error: Postgres 42703 or PostgREST's PGRST204 schema-cache
// miss. Lets the meta columns (migration 26) be absent without failing a view.
function isMissingColumn(err) {
  if (!err) return false;
  return err.code === '42703' || err.code === 'PGRST204' || /column|schema cache/i.test(err.message || '');
}

// Trim + cap a client-supplied string; null when empty so the column stays null.
function cap(v, n) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, n) : null;
}

export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const listId = body.listId;
    if (typeof listId !== 'string' || !listId.trim() || listId.length > 100) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_view', {
      p_list_id: listId.trim(),
    });
    if (error) {
      console.error('increment_view error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Log a timestamped view event for the rolling-24h Trending sort, tagged
    // with best-effort traffic metadata. Best-effort: never fail the view
    // request if this insert has trouble. The insert is TIERED so it degrades
    // gracefully when a migration hasn't been applied yet: full row (migration
    // 31) -> legacy meta only (26 + 30) -> bare row (04).
    const uaStr = request.headers.get('user-agent');
    const ua = parseUa(uaStr);
    const base = { list_id: listId.trim() };
    // Legacy meta (migrations 26 + 30): geo + parsed UA + a stable per-browser
    // visitor id from the sot_vid cookie set by VisitorBeacon (DAU/WAU/MAU).
    const meta = {};
    const vid = request.cookies.get('sot_vid')?.value;
    if (vid && vid.length <= 64) meta.visitor_id = vid;
    const country = countryFromRequest(request);
    const region = regionFromRequest(request);
    if (country) meta.country = country;
    if (region) meta.region = region;
    if (ua.browser) meta.ua_browser = ua.browser;
    if (ua.os) meta.ua_os = ua.os;
    // Source attribution (migration 31): bot flag, channel, referrer host, UTM
    // tags, city. referrer + utm are sent in the client body (the request's own
    // Referer header is just the list page). classifyChannel folds them into one
    // of: direct | organic | social | referral | internal.
    const meta2 = {};
    meta2.is_bot = isbot(uaStr || '');
    const refHost = referrerHost(body.referrer);
    if (refHost) meta2.referrer_host = refHost;
    meta2.channel = classifyChannel(refHost, body.utm_source, body.utm_medium);
    const utmSource = cap(body.utm_source, 200);
    const utmMedium = cap(body.utm_medium, 200);
    const utmCampaign = cap(body.utm_campaign, 200);
    if (utmSource) meta2.utm_source = utmSource;
    if (utmMedium) meta2.utm_medium = utmMedium;
    if (utmCampaign) meta2.utm_campaign = utmCampaign;
    const city = cityFromRequest(request);
    if (city) meta2.city = city;
    let { error: evErr } = await supabase
      .from('view_events')
      .insert({ ...base, ...meta, ...meta2 });
    if (evErr && isMissingColumn(evErr)) {
      ({ error: evErr } = await supabase
        .from('view_events')
        .insert({ ...base, ...meta }));
      if (evErr && isMissingColumn(evErr)) {
        ({ error: evErr } = await supabase.from('view_events').insert(base));
      }
    }
    if (evErr) console.error('view_event insert error', evErr);
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
