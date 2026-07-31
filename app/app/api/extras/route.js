import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { listId, itemName } = await request.json();
    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (typeof itemName !== 'string' || !itemName.trim()) {
      return NextResponse.json({ error: 'itemName required' }, { status: 400 });
    }
    if (listId.length > 100 || itemName.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }

    const { error } = await supabase
      .from('extras')
      .upsert(
        { list_id: listId.trim(), item_name: itemName.trim() },
        { onConflict: 'list_id,item_name', ignoreDuplicates: true }
      );

    if (error) {
      console.error('extras insert error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
