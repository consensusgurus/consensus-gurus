import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// TEMPORARY one-shot migration route (2026-07-07): rescore pre-composite Crux
// rows to the /16 scale. An old-scale score of 8 could only be a full win
// (8 solved + all placed right) = 16 composite. Out-of-guesses rows (score<8,
// 0 placements) already read correctly on the new scale. Era-gated to rows
// created before the composite deploy went READY. DELETE THIS ROUTE AFTER USE.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const KEY = 'e41c97aee6424f4cbc11a6ec58a69931';
const CUTOFF = '2026-07-08T00:02:40Z';

export async function GET(request) {
  const url = new URL(request.url);
  if (url.searchParams.get('key') !== KEY) {
    return new NextResponse('forbidden', { status: 403, headers: { 'Content-Type': 'text/plain' } });
  }
  if (url.searchParams.get('dry') === '1') {
    const { data: rows, error: qerr } = await supabaseAdmin
      .from('quiz_results')
      .select('id, quiz_id, score, correct_count, created_at, username')
      .in('quiz_id', ['crux-7-6-26', 'crux-7-7-26'])
      .order('created_at', { ascending: true });
    if (qerr) return new NextResponse('qerr: ' + qerr.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
    const lines = (rows || []).map((r) => [r.quiz_id, r.score, r.correct_count, r.created_at, r.username || 'anon'].join(' | '));
    return new NextResponse('rows ' + (rows || []).length + '\n' + lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } });
  }
  const { data, error } = await supabaseAdmin
    .from('quiz_results')
    .update({ score: 16, correct_count: 16 })
    .in('quiz_id', ['crux-7-6-26', 'crux-7-7-26'])
    .eq('score', 8)
    .lt('created_at', CUTOFF)
    .select('id, quiz_id, username, created_at');
  if (error) {
    return new NextResponse('error: ' + error.message, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
  const lines = (data || []).map((r) => r.quiz_id + ' | ' + (r.username || 'anon') + ' | ' + r.created_at);
  return new NextResponse('rescored ' + (data || []).length + ' rows to 16/16\n' + lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } });
}
