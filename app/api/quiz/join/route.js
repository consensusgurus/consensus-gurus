import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/quiz/join  { username, email } -> upsert identity by email.
// Open join, no verification. Done with the service-role client (one row per
// email via case-insensitive match), so it bypasses RLS and needs no RPC.
// Returns only the caller's own username/email.
export async function POST(request) {
  try {
    const { username, email } = (await request.json()) || {};
    if (typeof username !== 'string' || !username.trim() || username.trim().length > 40) {
      return NextResponse.json({ error: 'Username required (max 40 characters).' }, { status: 400 });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    const uname = username.trim();
    const mail = email.trim();

    const { data: existing, error: selErr } = await supabaseAdmin
      .from('quiz_users')
      .select('id, username, email')
      .ilike('email', mail)
      .maybeSingle();
    if (selErr) {
      console.error('quiz join select error', selErr);
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
    }

    let row;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .update({ username: uname })
        .eq('id', existing.id)
        .select('username, email')
        .single();
      if (error) {
        console.error('quiz join update error', error);
        return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
      }
      row = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .insert({ username: uname, email: mail })
        .select('username, email')
        .single();
      if (error) {
        if (error.code === '23505') {
          const { data: d2 } = await supabaseAdmin
            .from('quiz_users')
            .update({ username: uname })
            .ilike('email', mail)
            .select('username, email')
            .single();
          row = d2;
        } else {
          console.error('quiz join insert error', error);
          return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
        }
      } else {
        row = data;
      }
    }
    return NextResponse.json({ username: row?.username, email: row?.email });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
