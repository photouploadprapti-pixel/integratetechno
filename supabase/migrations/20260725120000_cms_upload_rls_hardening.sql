-- Reduce storage RLS DB load and keep editor checks resilient.
-- Prefer JWT role claims before querying public.users.

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('editor', 'super_admin')
      or (auth.jwt() -> 'user_metadata' ->> 'role') in ('editor', 'super_admin'),
      false
    )
    or exists (
      select 1
      from public.users
      where id = auth.uid()
        and role in ('editor', 'super_admin')
    );
$$;

-- Ensure the media bucket stays public-readable with sensible limits.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
