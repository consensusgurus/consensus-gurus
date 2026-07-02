import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';

// GET /api/visitors -> { visitors }
// One site-wide page-view total (list views + quiz-page views), so the shared
// header shows the SAME visitors figure on every page (home, quizzes, list
// detail, quiz play). Summed across both view tables; best-effort (0 on error).
export async function GET() {
  try {
    const [v, qv] = await Promise.all([
      fetchAllRows(supabase, 'views', 'list_id,count', ['list_id']),
      fetchAllRows(supabase, 'quiz_views', 'quiz_id,count', ['quiz_id']),
    ]);
    const sum = (r) => (r.data || []).reduce((a, x) => a + (x.count || 0), 0);
    const visitors = sum(v) + sum(qv);
    return NextResponse.json(
      { visitors },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (e) {
    return NextResponse.json({ visitors: 0 });
  }
}
