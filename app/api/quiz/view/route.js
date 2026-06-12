import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/quiz/view  { quizId }
// Records one quiz-page view: bumps the all-time total (increment_quiz_view)
// and logs a timestamped event for the rolling-24h admin analytics. Mirrors
// /api/views for lists.
export async function POST(request) {
  try {
    const { quizId } = await request.json();
    if (typeof quizId !== 'string' || !quizId.trim() || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_quiz_view', {
      p_quiz_id: quizId.trim(),
    });
    if (error) {
      console.error('increment_quiz_view error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Log a timestamped view event for the rolling-24h analytics. Best-effort:
    // never fail the view request if this insert has trouble.
    const { error: evErr } = await supabase
      .from('quiz_view_events')
      .insert({ quiz_id: quizId.trim() });
    if (evErr) console.error('quiz_view_event insert error', evErr);
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
