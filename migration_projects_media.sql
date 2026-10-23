-- Adds editable project cover images and a public-read, admin-write bucket.
alter table public.projects add column if not exists image_url text;
alter table public.projects add column if not exists live_url text;
alter table public.projects add column if not exists github_url text;
alter table public.projects add column if not exists video_url text;
update public.projects set live_url = link where live_url is null and link is not null and link <> '#';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "project image public read" on storage.objects;
drop policy if exists "project image admin write" on storage.objects;
drop policy if exists "project image admin update" on storage.objects;
drop policy if exists "project image admin delete" on storage.objects;
create policy "project image public read" on storage.objects for select using (bucket_id = 'project-images');
create policy "project image admin write" on storage.objects for insert with check (bucket_id = 'project-images' and public.is_admin());
create policy "project image admin update" on storage.objects for update using (bucket_id = 'project-images' and public.is_admin());
create policy "project image admin delete" on storage.objects for delete using (bucket_id = 'project-images' and public.is_admin());
