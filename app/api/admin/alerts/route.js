// Admin action: resolve a consensus alert (research done). POST { id }.

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
    if (!id) {
      return NextResponse.json({ error: 'missing id' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('consensus_alerts')
      .update({ resolved: true })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('admin alerts error', err);
    return NextResponse.json({ error: 'failed to resolve alert' }, { status: 500 });
  }
}
