import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { buildLeaderboardMatrix } from '@/lib/quiz-anon';
import { parseUa, countryFromRequest, regionFromRequest, cityFromRequest, timezoneFromRequest, languageFromRequest, referrerHost } from '@/lib/ua';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function summarize(rows) {
  const plays = rows.length;
  const best = plays ? Math.max(...rows.map((r) => r.score)) : null;
  // Fastest time recorded AT the best score, across ALL completed plays
  // (anonymous included, not just the signed-up leaderboard). Lets the client
  // tell whether a finished run is the outright #1 (top score, fastest time).
  const topTime = best != null
    ? Math.min(...rows.filter((r) => r.score === best).map((r) => (r.time_elapsed ?? Infinity)))
    : null;
  // Two composable leaderboard axes (population x filter) -> 6 boards, keyed
  // "<population>:<filter>" in `leaderboards`. Anonymous players appear in every
  // view EXCEPT 'registered:*'; in particular 'all:first' lists everyone's first
  // attempt (anon included), which the "All players + First try" toggle shows.
  // Legacy flat keys are kept for the compact strip/snippet and older clients:
  // leaderboardFirst now resolves to 'all:first' so anonymous first plays are
  // no longer dropped.
  const leaderboards = buildLeaderboardMatrix(rows);
  const leaderboard = leaderboards['registered:all'];
  const leaderboardMobile = leaderboards['all:mobile'];
  const leaderboardFirst = leaderboards['all:first'];
  const leaderboardAll = leaderboards['all:all'];
  // Exact score distribution over ALL completed attempts, so the client can
  // report the real share of attempts a finished run beat (no modeled curve).
  const scoreDist = {};
  for (const r of rows) { const sv = Number(r.score) || 0; scoreDist[sv] = (scoreDist[sv] || 0) + 1; }
  return { plays, best, topTime: Number.isFinite(topTime) ? topTime : null, leaderboard, leaderboardMobile, leaderboardFirst, leaderboardAll, leaderboards, scoreDist };
}

// POST /api/quiz/result  { quizId, score, total, timeElapsed, email? }
// Records one completed game (this is what makes the play count + average
// real). If email matches a joined user, the result is attributed to them and
// feeds the leaderboard. Returns refreshed { plays, avg, leaderboard }.
//
// Scores are client-submitted; values are sanity-bounded here but not
// cryptographically verified - acceptable for a casual leaderboard.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const { score, total, timeElapsed, email } = body;
    const correct = Number.isInteger(body.correct) ? Math.max(0, Math.min(total, body.correct)) : null;
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;
    // Traffic metadata: client may pass an explicit isMobile flag; otherwise we
    // derive it (and the browser/OS) from the user-agent. Country/region come
    // from Vercel's edge geo headers (null off-Vercel). All best-effort.
    const ua = parseUa(request.headers.get('user-agent'));
    const isMobile = typeof body.isMobile === 'boolean' ? body.isMobile : ua.isMobile;
    const country = countryFromRequest(request);
    const region = regionFromRequest(request);
    // Finer traffic metadata (migration 27). city/timezone come from Vercel edge
    // geo headers; language from Accept-Language; referrer is the browser's
    // document.referrer sent in the body (the request's own Referer header is
    // just the quiz page, so it can't reveal the real traffic source) reduced to
    // a bare host. A self-referral (our own host) is labeled "internal"; an empty
    // referrer is "direct".
    const city = cityFromRequest(request);
    const timezone = timezoneFromRequest(request);
    const language = languageFromRequest(request);
    let referrer = null;
    if (typeof body.referrer === 'string' && body.referrer.trim()) {
      const h = referrerHost(body.referrer);
      referrer = h ? (/(^|\.)sourceoftruths\.com$/i.test(h) ? 'internal' : h) : null;
    } else if (body.referrer === '' || body.referrer === null) {
      referrer = 'direct';
    }

    if (!quizId || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }
    if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || total > 100000 || score < 0 || score > total) {
      return NextResponse.json({ error: 'bad score' }, { status: 400 });
    }
    if (!Number.isInteger(timeElapsed) || timeElapsed < 0 || timeElapsed > 36000) {
      return NextResponse.json({ error: 'bad time' }, { status: 400 });
    }

    // Attribute to a joined identity by email, or by the browser's anon_id when
    // the player signed up with a display name only (no email).
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    const user_id = ident ? ident.id : null;
    const username = ident ? ident.username : null;

    const baseRow = {
      quiz_id: quizId,
      user_id,
      username,
      score,
      total,
      time_elapsed: timeElapsed,
    };
    // Try the richest row first, then drop optional columns that a not-yet-applied
    // migration may be missing (country/region/ua_* -> migration 26,
    // is_mobile -> 25, correct_count -> 24, anon_id -> 22).
    const guessesUsed = Number.isInteger(body.guessesUsed) && body.guessesUsed >= 0 && body.guessesUsed <= 10000 ? body.guessesUsed : null;
    const withGuesses = guessesUsed != null ? { guesses_used: guessesUsed } : {};
    const withCorrect = correct != null ? { correct_count: correct } : {};
    const withMobile = isMobile != null ? { is_mobile: isMobile } : {};
    const withMeta = {};
    if (country) withMeta.country = country;
    if (region) withMeta.region = region;
    if (ua.browser) withMeta.ua_browser = ua.browser;
    if (ua.os) withMeta.ua_os = ua.os;
    const withMeta27 = {};
    if (city) withMeta27.city = city;
    if (timezone) withMeta27.timezone = timezone;
    if (referrer) withMeta27.referrer = referrer;
    if (language) withMeta27.language = language;
    const attempts = [
      { ...baseRow, anon_id: anonId, ...withCorrect, ...withMobile, ...withMeta, ...withMeta27, ...withGuesses },
      { ...baseRow, anon_id: anonId, ...withCorrect, ...withMobile, ...withMeta, ...withMeta27 },
      { ...baseRow, anon_id: anonId, ...withCorrect, ...withMobile, ...withMeta },
      { ...baseRow, anon_id: anonId, ...withCorrect, ...withMobile },
      { ...baseRow, anon_id: anonId, ...withCorrect },
      { ...baseRow, anon_id: anonId },
      baseRow,
    ];
    let inserted = null, insErr = null;
    for (const row of attempts) {
      ({ data: inserted, error: insErr } = await supabaseAdmin.from('quiz_results').insert(row).select('id').single());
      if (!insErr) break;
      if (insErr.code !== '42703' && insErr.code !== 'PGRST204' && !/column|schema cache/i.test(insErr.message || '')) break; // a real error, not a missing column (Postgres 42703 OR PostgREST PGRST204 schema-cache miss)
    }
    if (insErr) {
      console.error('quiz_results insert error', insErr);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }

    const data = [];
    let cols = 'id, user_id, username, score, time_elapsed, anon_id, created_at, is_mobile, guesses_used';
    for (let from = 0; ; from += 1000) {
      let { data: page, error } = await supabaseAdmin
        .from('quiz_results')
        .select(cols)
        .eq('quiz_id', quizId)
        .order('id', { ascending: true })
        .range(from, from + 999);
      if (error && cols.includes(', guesses_used') && (error.code === '42703' || error.code === 'PGRST204' || /column|schema cache/i.test(error.message || ''))) {
        cols = cols.replace(', guesses_used', ''); from -= 1000; continue;
      }
      if (error && cols.includes(', is_mobile') && (error.code === '42703' || error.code === 'PGRST204' || /column|schema cache/i.test(error.message || ''))) {
        cols = cols.replace(', is_mobile', ''); from -= 1000; continue;
      }
      if (!page || page.length === 0) break;
      data.push(...page);
      if (page.length < 1000) break;
    }
    return NextResponse.json({ ...summarize(data), resultId: inserted?.id ?? null });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
