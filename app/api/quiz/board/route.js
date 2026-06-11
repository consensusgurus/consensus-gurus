import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Summarize completed games for a quiz into play count, average correct, and
// the leaderboard (each signed-up user's best attempt, ranked by score desc
// then time asc). Computed in JS over service-role rows so it is fully
// deterministic and RLS-independent.
export function summarize(rows) {
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

// GET /api/quiz/board?quizId=...  -> { plays, avg, leaderboard }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = (searchParams.get('quizId') || '').trim();
  if (!quizId || quizId.length > 100) {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('user_id, username, score, time_elapsed')
      .eq('quiz_id', quizId);
    if (error) {
      console.error('quiz board error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json(summarize(data || []));
  } catch (e) {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}
