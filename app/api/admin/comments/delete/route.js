import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Admin: delete a public list comment by id (removes it from the list page
// Activity feed). Mirrors the complaint-dismiss route.
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (id === undefined || id === null || `${id}`.length > 64) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('list_comments').delete().eq('id', id);
    if (error) {
      console.error('comment delete error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
