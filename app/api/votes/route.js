import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { listId, itemName, delta } = body || {};

    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (typeof itemName !== 'string' || !itemName.trim()) {
      return NextResponse.json({ error: 'itemName required' }, { status: 400 });
    }
    if (typeof delta !== 'number' || !Number.isFinite(delta) || Math.abs(delta) > 3) {
      return NextResponse.json({ error: 'delta must be -3..3' }, { status: 400 });
    }
    if (listId.length > 100 || itemName.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('apply_vote', {
      p_list_id: listId.trim(),
      p_item_name: itemName.trim(),
      p_delta: delta,
    });

    if (error) {
      console.error('apply_vote error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ score: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
