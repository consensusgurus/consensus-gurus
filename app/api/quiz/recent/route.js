import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/recent -> { plays: [{quizId, username, score, total}] }
// The 20 most recent completed games, newest first, for the /quizzes ticker.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('quiz_id, username, score, total, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      console.error('quiz recent error', error);
      return NextResponse.json({ plays: [] });
    }
    return NextResponse.json({ plays: (data || []).map((r) => ({ quizId: r.quiz_id, username: r.username || null, score: r.score, total: r.total })) });
  } catch (e) {
    return NextResponse.json({ plays: [] });
  }
}
