-- =========================================================================
-- Migration: email alert on new user-submitted vote items (extras)
-- Adds an after-insert webhook on public.extras that POSTs the new row to
-- the send-notification-email edge function, exactly like the existing
-- user_lists / complaints webhooks. The edge function must already handle
-- the "extras" table (see supabase/functions/send-notification-email).
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

-- The pg_net / supabase_functions extensions back database webhooks. They
-- are already enabled in this project (the user_lists + complaints webhooks
-- use them), but enable defensively in case this runs on a fresh project.
create extension if not exists pg_net with schema extensions;

-- Drop any prior version so this migration is idempotent.
drop trigger if exists notify_extras_insert on public.extras;

-- Fire the edge function on every new extra. supabase_functions.http_request
-- sends the standard webhook payload { type, table, record, schema, old_record },
-- and the edge function reads `table` + `record` from it.
create trigger notify_extras_insert
  after insert on public.extras
  for each row
  execute function supabase_functions.http_request(
    'https://mufbccvosxluscfaimxx.supabase.co/functions/v1/send-notification-email',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '5000'
  );
