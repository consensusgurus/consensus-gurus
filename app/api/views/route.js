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
    return NextResponse.json({ count: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
