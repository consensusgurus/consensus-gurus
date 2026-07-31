import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Admin: post or delete an editor's note on a list. Notes render publicly in
// the list Activity feed and the site-wide /feed as "Editor's Note: <note>".
//   POST { listId, note }      -> insert
//   POST { id, remove: true }  -> delete
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = (await request.json()) || {};

    if (body.remove && body.id !== undefined && body.id !== null) {
      if (`${body.id}`.length > 64) {
        return NextResponse.json({ error: 'bad id' }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from('list_editor_notes').delete().eq('id', body.id);
      if (error) {
        console.error('note delete error', error);
        return NextResponse.json({ error: 'db error' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    const listId = typeof body.listId === 'string' ? body.listId.trim() : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';
    if (!listId || listId.length > 100) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (!note) {
      return NextResponse.json({ error: 'note required' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('list_editor_notes')
      .insert({ list_id: listId, note })
      .select('id, list_id, note, created_at')
      .single();
    if (error) {
      console.error('note insert error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, note: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
