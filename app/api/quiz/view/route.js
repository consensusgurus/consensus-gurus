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

// POST /api/quiz/view  { quizId }
// Records one quiz-page view: bumps the all-time total (increment_quiz_view)
// and logs a timestamped event for the rolling-24h admin analytics. Mirrors
// /api/views for lists.
export async function POST(request) {
  try {
    const { quizId } = await request.json();
    if (typeof quizId !== 'string' || !quizId.trim() || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_quiz_view', {
      p_quiz_id: quizId.trim(),
    });
    if (error) {
      console.error('increment_quiz_view error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Log a timestamped view event for the rolling-24h analytics, tagged with
    // best-effort traffic metadata. Best-effort: never fail the view request if
    // this insert has trouble, and retry without the meta columns if a
    // not-yet-applied migration (26) is missing them.
    const ua = parseUa(request.headers.get('user-agent'));
    const base = { quiz_id: quizId.trim() };
    const meta = {};
    const country = countryFromRequest(request);
    const region = regionFromRequest(request);
    if (country) meta.country = country;
    if (region) meta.region = region;
    if (ua.browser) meta.ua_browser = ua.browser;
    if (ua.os) meta.ua_os = ua.os;
    let { error: evErr } = await supabase
      .from('quiz_view_events')
      .insert({ ...base, ...meta });
    if (evErr && isMissingColumn(evErr)) {
      ({ error: evErr } = await supabase.from('quiz_view_events').insert(base));
    }
    if (evErr) console.error('quiz_view_event insert error', evErr);
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
