// Exchanges a signed handoff token for the identity it represents. See lib/identity-handoff.js
// for why the token is signed rather than passed in the clear.
//
// Beyond the anon id, this also resolves the ACCOUNT the anon belongs to (when one exists),
// so a claim can restore the player's signed-in state (sot_quiz_identity) as well as their
// anonymous history. That matters most for the PWA install path: an iOS home-screen app runs
// in its own storage partition, so without this the installed app opens signed out with no
// self-service way back for a name-only account. quiz_users.anon_id records only the FIRST
// browser (see lib/quiz-identity.js), so the fallback derives ownership from quiz_results
// attribution, the same way resolveAnonSet does.
//
// Node runtime (this was edge): crypto.subtle is global in Node 18+, and the identity lookup
// needs the supabase admin client. Only the MINTING side must stay edge (middleware).
import { NextResponse } from 'next/server';
import { verifyHandoff } from '@/lib/identity-handoff';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic'; // never cache an identity response

async function identityFor(anon) {
  try {
    const { data: u } = await supabaseAdmin
      .from('quiz_users').select('username, email').eq('anon_id', anon).maybeSingle();
    if (u && u.username) return u;
    const { data: r } = await supabaseAdmin
      .from('quiz_results').select('user_id').eq('anon_id', anon)
      .not('user_id', 'is', null).order('id', { ascending: false }).limit(1).maybeSingle();
    if (r && r.user_id) {
      const { data: u2 } = await supabaseAdmin
        .from('quiz_users').select('username, email').eq('id', r.user_id).maybeSingle();
      if (u2 && u2.username) return u2;
    }
  } catch (e) { /* identity restore is best-effort; the anon id alone is still useful */ }
  return null;
}

export async function POST(req) {
  let token = null;
  try { ({ token } = await req.json()); } catch (e) { /* malformed body */ }
  const id = await verifyHandoff(token);
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const who = await identityFor(id);
  // Diagnostics for Vercel logs (a PWA first launch lands here); no ids logged.
  console.log('[identity-claim]', JSON.stringify({ valid: true, account: !!(who && who.username) }));
  return NextResponse.json(
    { ok: true, id, username: (who && who.username) || null, email: (who && who.email) || null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
