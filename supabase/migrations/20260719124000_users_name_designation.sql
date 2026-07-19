-- Add staff designation and sync names for known integratebd accounts.

alter table public.users
  add column if not exists designation text;

-- Keep auth → public.users sync aware of designation metadata.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role public.user_role := 'employee';
  resolved_name text;
  resolved_designation text;
  role_text text;
begin
  role_text := coalesce(
    new.raw_app_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'role',
    'employee'
  );

  begin
    resolved_role := role_text::public.user_role;
  exception when others then
    resolved_role := 'employee';
  end;

  resolved_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  resolved_designation := nullif(new.raw_user_meta_data ->> 'designation', '');

  insert into public.users (id, email, name, designation, role)
  values (new.id, new.email, resolved_name, resolved_designation, resolved_role)
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.users.name),
        designation = coalesce(excluded.designation, public.users.designation),
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

-- Ensure auth users missing from public.users are linked (e.g. accounts@).
insert into public.users (id, email, name, designation, role)
select
  u.id,
  u.email,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(u.email, 'user'), '@', 1)
  ),
  nullif(u.raw_user_meta_data ->> 'designation', ''),
  case
    when coalesce(u.raw_app_meta_data ->> 'role', u.raw_user_meta_data ->> 'role') = 'super_admin'
      then 'super_admin'::public.user_role
    when coalesce(u.raw_app_meta_data ->> 'role', u.raw_user_meta_data ->> 'role') = 'admin'
      then 'admin'::public.user_role
    when coalesce(u.raw_app_meta_data ->> 'role', u.raw_user_meta_data ->> 'role') = 'editor'
      then 'editor'::public.user_role
    else 'employee'::public.user_role
  end
from auth.users u
on conflict (id) do nothing;

-- Seed known staff names + designations into public.users
update public.users set
  name = 'Md. Mashiur Rahman Khan',
  designation = 'Senior Manager',
  updated_at = now()
where lower(email) = 'sales@integratebd.com';

update public.users set
  name = 'Kartick Chandra Podder',
  designation = 'Head of Business Development',
  updated_at = now()
where lower(email) = 'accounts@integratebd.com';

update public.users set
  name = 'Kingshuk Dhar',
  designation = 'Senior Manager',
  updated_at = now()
where lower(email) = 'sales1@integratebd.com';

update public.users set
  name = 'Md. Tanvir Hossen',
  designation = 'Assistant Manager',
  updated_at = now()
where lower(email) = 'service2@integratebd.com';

update public.users set
  name = 'Shohag Biswas',
  designation = 'Assistant Manager',
  updated_at = now()
where lower(email) = 'service1@integratebd.com';

update public.users set
  name = 'GM Al-Amin',
  designation = 'Junior Executive',
  updated_at = now()
where lower(email) = 'service4@integratebd.com';

update public.users set
  name = 'Md. Homyun Kobir',
  designation = 'Assistant General Manager',
  updated_at = now()
where lower(email) = 'service@integratebd.com';

update public.users set
  name = 'Bijoy Prosad',
  designation = 'CEO',
  updated_at = now()
where lower(email) = 'bijoy@integratebd.com';

-- Mirror full_name + designation into auth user metadata for app displays
update auth.users u
set raw_user_meta_data =
  coalesce(u.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'full_name', p.name,
    'designation', p.designation
  )
from (
  values
    ('sales@integratebd.com', 'Md. Mashiur Rahman Khan', 'Senior Manager'),
    ('accounts@integratebd.com', 'Kartick Chandra Podder', 'Head of Business Development'),
    ('sales1@integratebd.com', 'Kingshuk Dhar', 'Senior Manager'),
    ('service2@integratebd.com', 'Md. Tanvir Hossen', 'Assistant Manager'),
    ('service1@integratebd.com', 'Shohag Biswas', 'Assistant Manager'),
    ('service4@integratebd.com', 'GM Al-Amin', 'Junior Executive'),
    ('service@integratebd.com', 'Md. Homyun Kobir', 'Assistant General Manager'),
    ('bijoy@integratebd.com', 'Bijoy Prosad', 'CEO')
) as p(email, name, designation)
where lower(u.email) = p.email;
