import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Editor\'s Desk | Consensus Gurus',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdmin()) {
    redirect('/admin/login');
  }

  const { data, error } = await supabaseAdmin
    .from('user_lists')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('admin fetch error', error);
  }

  const lists = (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.type,
    blurb: row.blurb,
    items: (row.sources?.ai?.items) || row.vote_items || [],
    published: row.published,
    submittedAt: row.submitted_at,
  }));

  return <AdminClient initialLists={lists} />;
}
