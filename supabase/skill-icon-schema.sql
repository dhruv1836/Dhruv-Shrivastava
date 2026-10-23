-- Run once in Supabase Dashboard → SQL Editor to enable custom skill logos.
alter table public.skills
  add column if not exists icon_url text;
