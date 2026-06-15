import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/recent -> { plays: [{quizId, username, score, total}] }
// The 60 most recent completed games, newest first. Powers the /quizzes
// ticker AND the Last Played board, which de-dupes this feed by quiz; a wider
// window keeps Last Played filled to 3 distinct quizzes during repeat-play runs.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('quiz_id, username, score, total, created_at')
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) {
      console.error('quiz recent error', error);
      return NextResponse.json({ plays: [] });
    }
    return NextResponse.json({ plays: (data || []).map((r) => ({ quizId: r.quiz_id, username: r.username || null, score: r.score, total: r.total, playedAt: r.created_at || null })) });
  } catch (e) {
    return NextResponse.json({ plays: [] });
  }
}
