import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Public endpoint: a reader posts a comment on a list. Stored in the
// `list_comments` table and surfaced live in the list page's Activity feed
// (via /api/list-feed) and the admin panel. Name is optional.
export async function POST(request) {
  try {
    const body = await request.json();
    const { listId, name, body: text } = body || {};

    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (listId.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }
    const cleanBody = typeof text === 'string' ? text.trim().slice(0, 1000) : '';
    if (!cleanBody) {
      return NextResponse.json({ error: 'comment required' }, { status: 400 });
    }
    // Name is optional; empty -> null so the UI can show "Guest".
    const cleanName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 120) : null;

    const { error } = await supabase.from('list_comments').insert({
      list_id: listId.trim(),
      name: cleanName,
      body: cleanBody,
    });

    if (error) {
      console.error('comment insert error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
