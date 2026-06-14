import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/totals -> { total, byQuiz: {id:count}, recent7: {id:count}, recent12h: {id:count} }
// Aggregate play counts across every quiz (all completed games, signed-up or
// not), for the /quizzes index counter and the Popular / Trending sorts.
export async function GET() {
  try {
    const { data, error } = await fetchAllRows(supabaseAdmin, 'quiz_results', 'quiz_id, created_at', ['quiz_id']);
    if (error) {
      console.error('quiz totals error', error);
      return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {} });
    }
    const rows = data || [];
    const byQuiz = {};
    const recent7 = {};
    const recent12h = {};
    const now = Date.now();
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
    const cutoff12h = now - 12 * 60 * 60 * 1000;
    for (const r of rows) {
      byQuiz[r.quiz_id] = (byQuiz[r.quiz_id] || 0) + 1;
      if (r.created_at) {
        const t = new Date(r.created_at).getTime();
        if (t >= cutoff7) recent7[r.quiz_id] = (recent7[r.quiz_id] || 0) + 1;
        if (t >= cutoff12h) recent12h[r.quiz_id] = (recent12h[r.quiz_id] || 0) + 1;
      }
    }
    return NextResponse.json({ total: rows.length, byQuiz, recent7, recent12h });
  } catch (e) {
    return NextResponse.json({ total: 0, byQuiz: {}, recent7: {}, recent12h: {} });
  }
}
