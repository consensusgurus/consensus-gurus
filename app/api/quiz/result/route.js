import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST /api/quiz/result  { quizId, score, total, timeElapsed, email? }
// Records one completed game (this is what makes the play count + average
// real). If email matches a joined user, the result is attributed to them and
// feeds the leaderboard. Returns refreshed { plays, avg, leaderboard }.
//
// Scores are client-submitted; values are sanity-bounded here but not
// cryptographically verified — acceptable for a casual leaderboard.
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

    const { error: insErr } = await supabaseAdmin.from('quiz_results').insert({
      quiz_id: quizId,
      user_id,
      username,
      score,
      total,
      time_elapsed: timeElapsed,
    });
    if (insErr) {
      console.error('quiz_results insert error', insErr);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }

    const [statsRes, lbRes] = await Promise.all([
      supabase.rpc('quiz_stats', { p_quiz_id: quizId }),
      supabase.rpc('quiz_leaderboard', { p_quiz_id: quizId, p_limit: 25 }),
    ]);
    const s = Array.isArray(statsRes.data) ? statsRes.data[0] : statsRes.data;
    return NextResponse.json({
      plays: Number(s?.plays || 0),
      avg: s?.avg_score != null ? Number(s.avg_score) : null,
      leaderboard: (lbRes.data || []).map((r) => ({
        username: r.username,
        score: r.score,
        timeElapsed: r.time_elapsed,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
