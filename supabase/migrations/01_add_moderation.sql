-- =========================================================================
-- Migration: add moderation to user_lists
-- Run this in your Supabase SQL Editor if you've already deployed
-- a version of the schema without the published column.
-- (Fresh installs should use schema.sql which already includes this.)
-- =========================================================================

-- Add the published flag, defaults to false so new submissions are pending
alter table user_lists add column if not exists published boolean default false not null;

-- Remove the old policy that exposed all submissions publicly
drop policy if exists "user_lists are public" on user_lists;

-- Replace it with one that only shows approved lists to the public
create policy "published user_lists are public" on user_lists
  for select using (published = true);
