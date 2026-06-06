-- =========================================================================
-- Migration: editor responses on public comments and review requests
--
-- Lets an admin reply to a public comment (list_comments) or a review request
-- (complaints) from the admin panel. The response renders publicly in the
-- list Activity feed and the site-wide /feed as "Editor: <response>".
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

alter table public.list_comments
  add column if not exists editor_response text,
  add column if not exists responded_at timestamptz;

alter table public.complaints
  add column if not exists editor_response text,
  add column if not exists responded_at timestamptz;
