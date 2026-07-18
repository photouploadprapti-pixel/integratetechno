-- CMS: editor role + site_content store + public media bucket
-- NOTE: ADD VALUE for enums must be committed before use.
-- Apply in two steps if running as one script fails with 55P04:
--   1) the DO block that adds 'editor'
--   2) the remaining statements below

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'user_role'
      and e.enumlabel = 'editor'
  ) then
    alter type public.user_role add value 'editor';
  end if;
end
$$;

create table if not exists public.site_content (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_content enable row level security;

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('editor', 'super_admin')
  );
$$;

drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "site_content_insert_editor" on public.site_content;
create policy "site_content_insert_editor"
  on public.site_content for insert
  to authenticated
  with check (public.is_editor());

drop policy if exists "site_content_update_editor" on public.site_content;
create policy "site_content_update_editor"
  on public.site_content for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "site_content_delete_editor" on public.site_content;
create policy "site_content_delete_editor"
  on public.site_content for delete
  to authenticated
  using (public.is_editor());

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

drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cms-media');

drop policy if exists "cms_media_editor_insert" on storage.objects;
create policy "cms_media_editor_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'cms-media' and public.is_editor());

drop policy if exists "cms_media_editor_update" on storage.objects;
create policy "cms_media_editor_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'cms-media' and public.is_editor())
  with check (bucket_id = 'cms-media' and public.is_editor());

drop policy if exists "cms_media_editor_delete" on storage.objects;
create policy "cms_media_editor_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cms-media' and public.is_editor());
