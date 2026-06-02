import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Public endpoint: a reader files a complaint / requests new research on a list.
// Stored in the `complaints` table and surfaced in the admin "Notices" tab.
export async function POST(request) {
  try {
    const body = await request.json();
    const { listId, listTitle, message, name, email } = body || {};

    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (listId.length > 100 || (listTitle && listTitle.length > 200)) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 1000) : '';
    // Name and email are optional contact fields.
    const cleanName = typeof name === 'string' ? name.trim().slice(0, 120) : '';
    const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 200) : '';

    const { error } = await supabase.from('complaints').insert({
      list_id: listId.trim(),
      list_title: (listTitle || '').toString().slice(0, 200),
      message: cleanMessage,
      name: cleanName,
      email: cleanEmail,
    });

    if (error) {
      console.error('complaint insert error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
