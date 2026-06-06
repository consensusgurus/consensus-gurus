import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Admin: delete the votes for one (listId, itemName) pair. Clears both the
// aggregate score row in `votes` and every logged event in `vote_events`, so
// the item's vote total resets to zero everywhere.
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const { listId, itemName } = await request.json();
    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (typeof itemName !== 'string' || !itemName.trim()) {
      return NextResponse.json({ error: 'itemName required' }, { status: 400 });
    }
    const lid = listId.trim();
    const item = itemName.trim();

    const agg = await supabaseAdmin.from('votes').delete().eq('list_id', lid).eq('item_name', item);
    if (agg.error) {
      console.error('vote aggregate delete error', agg.error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Best-effort: also clear the event log rows (non-fatal).
    try {
      await supabaseAdmin.from('vote_events').delete().eq('list_id', lid).eq('item_name', item);
    } catch (_) {
      /* ignore */
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
