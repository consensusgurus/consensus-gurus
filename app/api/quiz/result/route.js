import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { buildAllLeaderboard } from '@/lib/quiz-anon';

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
  // Signed-up players only, but EVERY qualifying play is listed (a single
  // player can appear more than once). Top 10 by score desc, then fastest time.
  // Per-user chronological attempt number (1 = that player's first completed
  // game for this quiz), assigned by row id ascending. Lets the UI tag each
  // leaderboard entry "(1st Try)", "(2nd Try)"... so multiple plays from the
  // same person are distinguishable.
  const signed = rows.filter((r) => r.user_id);
  const tryByUser = {};
  const tryOf = new Map();
  signed
    .slice()
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .forEach((r) => {
      tryByUser[r.user_id] = (tryByUser[r.user_id] || 0) + 1;
      tryOf.set(r, tryByUser[r.user_id]);
    });
  const rankSigned = (subset) => subset
    .slice()
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed || (a.username || '').localeCompare(b.username || ''))
    .slice(0, 10)
    .map((r) => ({ username: r.username, userKey: 'u:' + r.user_id, score: r.score, timeElapsed: r.time_elapsed, tryNum: tryOf.get(r), playedAt: r.created_at }));
  const leaderboard = rankSigned(signed);
  // "Mobile" includes ALL players (registered + anonymous), filtered to games
  // played on a phone/tablet (is_mobile true). Anonymous mobile plays appear as
  // "Player #NNNNN", mirroring the All-players view. Legacy/unknown rows are NULL
  // and excluded. (First Try stays registered-only.)
  const leaderboardMobile = buildAllLeaderboard(rows.filter((r) => r.is_mobile === true));
  const leaderboardFirst = rankSigned(signed.filter((r) => tryOf.get(r) === 1));
  const leaderboardAll = buildAllLeaderboard(rows);
  // Exact score distribution over ALL completed attempts, so the client can
  // report the real share of attempts a finished run beat (no modeled curve).
  const scoreDist = {};
  for (const r of rows) { const sv = Number(r.score) || 0; scoreDist[sv] = (scoreDist[sv] || 0) + 1; }
  return { plays, best, topTime: Number.isFinite(topTime) ? topTime : null, leaderboard, leaderboardMobile, leaderboardFirst, leaderboardAll, scoreDist };
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
    const isMobile = typeof body.isMobile === 'boolean' ? body.isMobile : null;

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
    // migration may be missing (correct_count -> migration 24, anon_id -> 22).
    const withCorrect = correct != null ? { correct_count: correct } : {};
    const withMobile = isMobile != null ? { is_mobile: isMobile } : {};
    const attempts = [
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
    let cols = 'id, user_id, username, score, time_elapsed, anon_id, created_at, is_mobile';
    for (let from = 0; ; from += 1000) {
      let { data: page, error } = await supabaseAdmin
        .from('quiz_results')
        .select(cols)
        .eq('quiz_id', quizId)
        .order('id', { ascending: true })
        .range(from, from + 999);
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
