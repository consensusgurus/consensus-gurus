// Weekly research summary email, sent via Brevo. Runs Mondays on a Vercel
// cron (see vercel.json). Summarizes consensus alerts from the past 7 days
// plus the unresolved backlog, and emails the editor.
//
// Required env vars (Vercel > Settings > Environment Variables):
//   BREVO_API_KEY        - Brevo transactional API key
//   RESEARCH_EMAIL_TO    - recipient (e.g. mhmentz@gmail.com)
//   RESEARCH_EMAIL_FROM  - a sender verified in Brevo (e.g. alerts@sourceoftruths.com)
// Optional: CRON_SECRET (same bearer check as the daily consensus cron).

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.RESEARCH_EMAIL_TO;
  const from = process.env.RESEARCH_EMAIL_FROM;
  if (!apiKey || !to || !from) {
    return NextResponse.json(
      { error: 'BREVO_API_KEY, RESEARCH_EMAIL_TO, RESEARCH_EMAIL_FROM must be set' },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('consensus_alerts')
      .select('list_id,item_name,change_type,rank,detected_at')
      .eq('resolved', false)
      .order('detected_at', { ascending: false });
    if (error) throw error;

    const all = data || [];
    const cutoff = Date.now() - 7 * 86400000;
    const recent = all.filter((a) => new Date(a.detected_at).getTime() >= cutoff);
    const titles = new Map(LISTS.map((l) => [l.id, l.title]));

    const needsOf = (a) => {
      const descs = DESCRIPTIONS[a.list_id] || {};
      const imgs = HERO_IMAGES[a.list_id] || {};
      const needs = [];
      if (a.change_type === 'entered_top10' && !descs[a.item_name]) needs.push('description');
      if (a.change_type === 'entered_top3' && !imgs[a.item_name]) needs.push('hero photo');
      return needs;
    };

    // Group recent alerts by list.
    const byList = new Map();
    for (const a of recent) {
      if (!byList.has(a.list_id)) byList.set(a.list_id, []);
      byList.get(a.list_id).push(a);
    }

    let html;
    if (recent.length === 0) {
      html = `<p>No consensus changes this week.</p>`;
    } else {
      const sections = Array.from(byList.entries())
        .map(([listId, alerts]) => {
          const rows = alerts
            .map((a) => {
              const change = a.change_type === 'entered_top3' ? 'into the top 3' : 'into the top 10';
              const needs = needsOf(a);
              const needsTxt = needs.length ? ` — needs ${needs.join(' + ')}` : ' — research already covered, just resolve';
              return `<li><strong>${a.item_name}</strong> moved ${change}${a.rank ? ` (now #${a.rank})` : ''}${needsTxt}</li>`;
            })
            .join('');
          return `<h3 style="margin:16px 0 6px">${titles.get(listId) || listId}</h3><ul style="margin:0 0 10px 18px">${rows}</ul>`;
        })
        .join('');
      html = `<p><strong>${recent.length}</strong> consensus change${recent.length === 1 ? '' : 's'} in the past 7 days:</p>${sections}`;
    }
    html += `<p style="margin-top:18px">Unresolved research backlog: <strong>${all.length}</strong> alert${all.length === 1 ? '' : 's'}. Manage them in the <a href="https://sourceoftruths.com/admin">Research tab</a>.</p>`;

    const dateStr = new Date().toISOString().slice(0, 10);
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: from, name: 'Source of Truths' },
        to: [{ email: to }],
        subject: `Source of Truths: weekly consensus research summary (${dateStr})`,
        htmlContent: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1611">${html}</div>`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo ${res.status}: ${body}`);
    }

    return NextResponse.json({ ok: true, recentAlerts: recent.length, backlog: all.length });
  } catch (err) {
    console.error('weekly-research-email error', err);
    return NextResponse.json({ error: 'weekly research email failed' }, { status: 500 });
  }
}
