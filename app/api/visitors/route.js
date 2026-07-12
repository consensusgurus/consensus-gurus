import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // supabase reads must bypass Next's Data Cache, else the sum freezes at the last deploy's value (matches every other data route)

// GET /api/visitors -> { visitors }
// One site-wide page-view total (list views + quiz-page views), so the shared
// header shows the SAME visitors figure on every page (home, quizzes, list
// detail, quiz play). Best-effort (0 on error).
//
// Egress fix (2026-07-12): summed in SQL via site_view_total() (migration 34)
// so ~8 bytes leave Supabase instead of both whole view tables per cache miss.
// Falls back to the old whole-table sum until the migration is applied.
export async function GET() {
  try {
    let visitors = null;
    const { data: total, error } = await supabase.rpc('site_view_total');
    if (!error && total != null && Number.isFinite(Number(total))) {
      visitors = Number(total);
    } else {
      const [v, qv] = await Promise.all([
        fetchAllRows(supabase, 'views', 'list_id,count', ['list_id']),
        fetchAllRows(supabase, 'quiz_views', 'quiz_id,count', ['quiz_id']),
      ]);
      const sum = (r) => (r.data || []).reduce((a, x) => a + (x.count || 0), 0);
      visitors = sum(v) + sum(qv);
    }
    return NextResponse.json(
      { visitors },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  } catch (e) {
    return NextResponse.json({ visitors: 0 });
  }
}
