import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function summarize(rows) {
  const plays = rows.length;
  const best = plays ? Math.max(...rows.map((r) => r.score)) : null;
  // Signed-up players only, but EVERY qualifying play is listed (a single
  // player can appear more than once). Top 10 by score desc, then fastest time.
  const leaderboard = rows
    .filter((r) => r.user_id)
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed)
    .slice(0, 10)
    .map((r) => ({ username: r.username, score: r.score, timeElapsed: r.time_elapsed }));
  return { plays, best, leaderboard };
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

    if (!quizId || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }
    if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || total > 1000 || score < 0 || score > total) {
      return NextResponse.json({ error: 'bad score' }, { status: 400 });
    }
    if (!Number.isInteger(timeElapsed) || timeElapsed < 0 || timeElapsed > 36000) {
      return NextResponse.json({ error: 'bad time' }, { status: 400 });
    }

    let user_id = null;
    let username = null;
    if (typeof email === 'string' && email.trim()) {
      const { data: u } = await supabaseAdmin
        .from('quiz_users')
        .select('id, username')
        .ilike('email', email.trim())
        .maybeSingle();
      if (u) {
        user_id = u.id;
        username = u.username;
      }
    }

    const { data: inserted, error: insErr } = await supabaseAdmin.from('quiz_results').insert({
      quiz_id: quizId,
      user_id,
      username,
      score,
      total,
      time_elapsed: timeElapsed,
    }).select('id').single();
    if (insErr) {
      console.error('quiz_results insert error', insErr);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }

    const { data } = await supabaseAdmin
      .from('quiz_results')
      .select('user_id, username, score, time_elapsed')
      .eq('quiz_id', quizId);
    return NextResponse.json({ ...summarize(data || []), resultId: inserted?.id ?? null });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
