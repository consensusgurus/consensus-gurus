import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ALLOWED_LINK_TYPES = new Set([
  'amazon',
  'imdb',
  'maps',
  'mapsCity',
  'booking',
  'tripadvisor',
  'steam',
  'goodreads',
  'wiki',
  'search',
]);

const ALLOWED_TYPES = new Set([
  'food',
  'stores',
  'travel',
  'entertainment',
  'tech',
  'product',
  'other',
]);

export async function POST(request) {
  try {
    const list = await request.json();
    if (!list || typeof list !== 'object') {
      return NextResponse.json({ error: 'invalid list' }, { status: 400 });
    }
    if (typeof list.id !== 'string' || !list.id.startsWith('user-') || list.id.length > 100) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 });
    }
    if (typeof list.title !== 'string' || !list.title.trim() || list.title.length > 100) {
      return NextResponse.json({ error: 'invalid title' }, { status: 400 });
    }
    if (typeof list.category !== 'string' || list.category.length > 50) {
      return NextResponse.json({ error: 'invalid category' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(list.type)) {
      return NextResponse.json({ error: 'invalid type' }, { status: 400 });
    }
    if (list.linkType && !ALLOWED_LINK_TYPES.has(list.linkType)) {
      return NextResponse.json({ error: 'invalid linkType' }, { status: 400 });
    }
    if (typeof list.blurb !== 'string' || list.blurb.length > 250) {
      return NextResponse.json({ error: 'invalid blurb' }, { status: 400 });
    }

    const submitterName =
      typeof list.submitterName === 'string' && list.submitterName.trim()
        ? list.submitterName.trim().slice(0, 80)
        : null;
    const submitterEmail =
      typeof list.submitterEmail === 'string' && list.submitterEmail.trim()
        ? list.submitterEmail.trim().slice(0, 120)
        : null;

    const { error } = await supabase.from('user_lists').insert({
      id: list.id,
      title: list.title,
      category: list.category,
      type: list.type,
      link_type: list.linkType || 'search',
      blurb: list.blurb,
      default_source: list.defaultSource || 'ai',
      sources: list.sources || {},
      vote_items: list.vote?.items || [],
      links: list.links || null,
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      published: false,
    });

    if (error) {
      console.error('user_lists insert error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
