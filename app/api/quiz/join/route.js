import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/quiz/join  { username, email } -> upsert identity by email.
// Open join, no verification. Returns only the caller's own username/email.
export async function POST(request) {
  try {
    const { username, email } = (await request.json()) || {};
    if (typeof username !== 'string' || !username.trim() || username.trim().length > 40) {
      return NextResponse.json({ error: 'Username required (max 40 characters).' }, { status: 400 });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('quiz_join', {
      p_username: username.trim(),
      p_email: email.trim(),
    });
    if (error) {
      console.error('quiz_join error', error);
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
    }
    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ username: row?.username, email: row?.email });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
