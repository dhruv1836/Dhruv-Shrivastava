-- Enable live new-message notifications in the authenticated Admin inbox.
-- Safe to run more than once on a Supabase project.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
end;
$$;
