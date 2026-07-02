import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseUa, countryFromRequest, regionFromRequest } from '@/lib/ua';

export const dynamic = 'force-dynamic';

// A missing-column error: Postgres 42703 or PostgREST's PGRST204 schema-cache
// miss. Lets the meta columns (migration 26) be absent without failing a view.
function isMissingColumn(err) {
  if (!err) return false;
  return err.code === '42703' || err.code === 'PGRST204' || /column|schema cache/i.test(err.message || '');
}

export async function POST(request) {
  try {
    const { listId } = await request.json();
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
    // request if this insert has trouble, and retry without the meta columns if
    // a not-yet-applied migration (26) is missing them.
    const ua = parseUa(request.headers.get('user-agent'));
    const base = { list_id: listId.trim() };
    const meta = {};
    // Stable per-browser id from the sot_vid cookie (set client-side by
    // VisitorBeacon), used for distinct-visitor DAU/WAU/MAU. Best-effort: it
    // lives in the droppable meta bag so a not-yet-applied migration (30) falls
    // back to a bare insert. Cap length defensively.
    const vid = request.cookies.get('sot_vid')?.value;
    if (vid && vid.length <= 64) meta.visitor_id = vid;
    const country = countryFromRequest(request);
    const region = regionFromRequest(request);
    if (country) meta.country = country;
    if (region) meta.region = region;
    if (ua.browser) meta.ua_browser = ua.browser;
    if (ua.os) meta.ua_os = ua.os;
    let { error: evErr } = await supabase
      .from('view_events')
      .insert({ ...base, ...meta });
    if (evErr && isMissingColumn(evErr)) {
      ({ error: evErr } = await supabase.from('view_events').insert(base));
    }
    if (evErr) console.error('view_event insert error', evErr);
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
