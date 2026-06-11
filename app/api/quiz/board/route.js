import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/quiz/board?quizId=...  -> { plays, avg, leaderboard }
// Public read. Emails are never exposed (RPCs return only username/score/time).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = (searchParams.get('quizId') || '').trim();
  if (!quizId || quizId.length > 100) {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 });
  }
  try {
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
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}
