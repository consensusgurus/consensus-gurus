import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Admin: set (or clear) the editor response on a public comment or a review
// request. Shown publicly in the feeds as "Editor: <response>".
//   kind: 'comment' (list_comments) | 'review' (complaints)
//   response: text; blank clears the response.
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const { kind, id, response } = await request.json();
    const table = kind === 'comment' ? 'list_comments' : kind === 'review' ? 'complaints' : null;
    if (!table) {
      return NextResponse.json({ error: 'bad kind' }, { status: 400 });
    }
    if (id === undefined || id === null || `${id}`.length > 64) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const clean = typeof response === 'string' ? response.trim().slice(0, 1000) : '';
    const { error } = await supabaseAdmin
      .from(table)
      .update({ editor_response: clean || null, responded_at: clean ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      console.error('respond error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
