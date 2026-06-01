import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { listId } = await request.json();
    if (typeof listId !== 'string' || !listId.trim() || listId.length > 100) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('increment_view', {
      p_list_id: listId.trim(),
    });
    if (error) {
      console.error('increment_view error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Log a timestamped view event for the rolling-24h Trending sort. Best-effort:
    // never fail the view request if this insert has trouble.
    const { error: evErr } = await supabase
      .from('view_events')
      .insert({ list_id: listId.trim() });
    if (evErr) console.error('view_event insert error', evErr);
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
