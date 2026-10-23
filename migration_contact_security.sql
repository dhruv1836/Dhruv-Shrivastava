-- Apply this migration to an existing Supabase project before deploying the
-- contact-message Edge Function. It removes direct public table inserts and
-- creates a private, hourly rate limiter for the function.

drop policy if exists "anyone submit" on public.messages;

create table if not exists public.contact_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count int not null default 0
);
alter table public.contact_rate_limits enable row level security;

create or replace function public.consume_contact_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare current_count int;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));
  insert into public.contact_rate_limits (ip_hash, window_started_at, request_count)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
    set window_started_at = case
          when public.contact_rate_limits.window_started_at < now() - interval '1 hour' then now()
          else public.contact_rate_limits.window_started_at end,
        request_count = case
          when public.contact_rate_limits.window_started_at < now() - interval '1 hour' then 1
          else public.contact_rate_limits.request_count + 1 end
  returning request_count into current_count;
  return current_count <= 5;
end;
$$;
revoke all on function public.consume_contact_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text) to service_role;
