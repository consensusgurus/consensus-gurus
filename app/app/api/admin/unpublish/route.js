import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await request.json();
    if (typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('user_lists')
      .update({ published: false })
      .eq('id', id.trim());
    if (error) {
      console.error('unpublish error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
