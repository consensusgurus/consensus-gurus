import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function makeToken() {
  const a = 'abcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 10; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

// POST /api/duel/create  { quizId, anonId, name, opponentAnon?, opponentName?, device? }
export async function POST(request) {
  try {
    const b = (await request.json()) || {};
    const quizId = typeof b.quizId === 'string' ? b.quizId.trim() : '';
    const anonId = typeof b.anonId === 'string' && b.anonId.trim() ? b.anonId.trim().slice(0, 64) : null;
    const name = (typeof b.name === 'string' ? b.name.trim() : '').slice(0, 40) || 'Player';
    const opponentAnon = typeof b.opponentAnon === 'string' && b.opponentAnon.trim() ? b.opponentAnon.trim().slice(0, 64) : null;
    const opponentName = (typeof b.opponentName === 'string' ? b.opponentName.trim() : '').slice(0, 40) || null;
    const device = (b.device === 'mobile' || b.device === 'desktop') ? b.device : 'any';
    if (!quizId || quizId.length > 100) return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    if (!anonId) return NextResponse.json({ error: 'anonId required' }, { status: 400 });

    const baseRow = { quiz_id: quizId, challenger_anon: anonId, challenger_name: name, opponent_anon: opponentAnon, opponent_name: opponentAnon ? opponentName : null, status: 'open' };
    let tk = makeToken(), inserted = null, err = null;
    for (let tries = 0; tries < 5; tries++) {
      // try with device; fall back if the column is not present yet
      let attempt = await supabaseAdmin.from('quiz_duels').insert({ token: tk, ...baseRow, device }).select('token').single();
      if (attempt.error && (attempt.error.code === '42703' || /device|schema cache/i.test(attempt.error.message || ''))) {
        attempt = await supabaseAdmin.from('quiz_duels').insert({ token: tk, ...baseRow }).select('token').single();
      }
      inserted = attempt.data; err = attempt.error;
      if (!err) break;
      if (err.code === '23505') { tk = makeToken(); continue; }
      if (err.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
      break;
    }
    if (err) { console.error('duel create', err); return NextResponse.json({ error: 'db error' }, { status: 500 }); }
    return NextResponse.json({ token: inserted.token });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
