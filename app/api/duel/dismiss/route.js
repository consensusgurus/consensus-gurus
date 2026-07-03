import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// POST /api/duel/dismiss  { token, kind?, anonId }
// Record that this browser's player dismissed a duel notification so it stays
// dismissed across the account's devices (see /api/duel/notifications, which
// filters dismissed tokens across the resolved anon set). Best-effort: no-ops
// gracefully until migration 32 (quiz_duel_dismissals) is applied.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const token = typeof body.token === 'string' ? body.token.trim().slice(0, 64) : '';
    const anonId = typeof body.anonId === 'string' ? body.anonId.trim().slice(0, 64) : '';
    const kind = body.kind === 'seen' ? 'seen' : 'later';
    if (!token || !anonId) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabaseAdmin
      .from('quiz_duel_dismissals')
      .upsert({ duel_token: token, anon_id: anonId, kind }, { onConflict: 'duel_token,anon_id,kind', ignoreDuplicates: true });
    // 42P01 = table not created yet (pre-migration); tolerate so the localStorage
    // fast-path still works. 23505 = duplicate (already dismissed) -> fine.
    if (error && error.code !== '42P01' && error.code !== '23505') console.error('duel dismiss error', error);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
