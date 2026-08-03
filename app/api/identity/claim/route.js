// Exchanges a signed handoff token for the anon id it represents. See lib/identity-handoff.js
// for why the token is signed rather than passed in the clear.
import { NextResponse } from 'next/server';
import { verifyHandoff } from '@/lib/identity-handoff';

export const runtime = 'edge';          // crypto.subtle; matches the minting side
export const dynamic = 'force-dynamic'; // never cache an identity response

export async function POST(req) {
  let token = null;
  try { ({ token } = await req.json()); } catch { /* malformed body */ }
  const id = await verifyHandoff(token);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  return NextResponse.json({ ok: true, id }, { headers: { 'Cache-Control': 'no-store' } });
}
