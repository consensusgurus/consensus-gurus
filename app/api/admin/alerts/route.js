// Admin action: resolve a consensus alert (research done). POST { id }.
//
// Auth: either the admin cookie (the /admin panel) OR an
// "x-admin-token" header matching the ADMIN_TASK_TOKEN env var.
// The token path exists so the daily Cowork research task can resolve
// alerts after shipping the description/hero image. If ADMIN_TASK_TOKEN
// is unset, the token path is disabled and only the cookie works.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

export async function POST(request) {
  if (!isAdmin() && !tokenOk(request)) {
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
