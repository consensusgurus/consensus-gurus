// Server-only Supabase client. Uses the service_role key, which bypasses
// Row Level Security. NEVER import this from a 'use client' component or
// expose it to the browser.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey && typeof window === 'undefined') {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Admin routes will fail.');
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
