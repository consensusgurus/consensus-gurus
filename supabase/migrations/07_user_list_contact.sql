-- =========================================================================
-- Migration: optional submitter contact fields on user_lists
-- Adds nullable `submitter_name` and `submitter_email` columns to
-- public.user_lists so the "Request a List" form (/request) can capture the
-- submitter's optional name and email. These ride along on the existing
-- user_lists insert webhook, so they are surfaced in the admin panel AND
-- included in the notification email sent by the send-notification-email
-- edge function. No RLS change needed: the existing anon insert policy
-- ("anyone can submit lists") already permits inserting a user_lists row.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

alter table public.user_lists
  add column if not exists submitter_name  text,
  add column if not exists submitter_email text;
