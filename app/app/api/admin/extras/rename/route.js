import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST: rename a user-submitted extra item. Atomically moves any
// aggregated vote score across via the rename_extra RPC.
// Body: { listId, oldName, newName }
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const listId = typeof body?.listId === 'string' ? body.listId.trim() : '';
    const oldName = typeof body?.oldName === 'string' ? body.oldName.trim() : '';
    const newName = typeof body?.newName === 'string' ? body.newName.trim() : '';

    if (!listId) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (!oldName) {
      return NextResponse.json({ error: 'oldName required' }, { status: 400 });
    }
    if (!newName) {
      return NextResponse.json({ error: 'newName required' }, { status: 400 });
    }
    if (listId.length > 100 || oldName.length > 100 || newName.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }

    if (oldName === newName) {
      return NextResponse.json({ ok: true, noop: true });
    }

    const { error } = await supabaseAdmin.rpc('rename_extra', {
      p_list_id: listId,
      p_old_name: oldName,
      p_new_name: newName,
    });

    if (error) {
      console.error('rename_extra error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
