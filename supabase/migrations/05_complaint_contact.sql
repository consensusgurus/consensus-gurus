-- =========================================================================
-- Migration: optional contact fields on reader complaints / research requests
-- Adds nullable `name` and `email` columns to public.complaints so the
-- "Speak With The Manager" popup can capture optional contact details.
-- These ride along on the existing complaints insert webhook, so they are
-- surfaced in the admin Notices tab AND included in the notification email
-- sent by the send-notification-email edge function. No RLS change needed:
-- the anon insert policy already permits inserting a complaint row.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

alter table public.complaints
  add column if not exists name  text,
  add column if not exists email text;
