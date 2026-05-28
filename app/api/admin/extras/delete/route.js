import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST: delete a user-submitted extra item from extras and votes.
// Body: { listId, itemName }
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const listId = typeof body?.listId === 'string' ? body.listId.trim() : '';
    const itemName = typeof body?.itemName === 'string' ? body.itemName.trim() : '';

    if (!listId) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (!itemName) {
      return NextResponse.json({ error: 'itemName required' }, { status: 400 });
    }
    if (listId.length > 100 || itemName.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }

    // Delete from both tables. Errors on either are reported.
    const [extrasRes, votesRes] = await Promise.all([
      supabaseAdmin.from('extras').delete().eq('list_id', listId).eq('item_name', itemName),
      supabaseAdmin.from('votes').delete().eq('list_id', listId).eq('item_name', itemName),
    ]);

    if (extrasRes.error) {
      console.error('extras delete error', extrasRes.error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    if (votesRes.error) {
      console.error('votes delete error', votesRes.error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
