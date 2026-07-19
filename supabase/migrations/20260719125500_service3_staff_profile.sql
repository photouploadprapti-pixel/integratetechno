-- Seed / update service3 staff profile.

update public.users set
  name = 'Protty Chandro Pondit',
  designation = 'Sr. Assistant Manager',
  updated_at = now()
where lower(email) = 'service3@integratebd.com';

update auth.users
set raw_user_meta_data =
  coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'full_name', 'Protty Chandro Pondit',
    'designation', 'Sr. Assistant Manager'
  )
where lower(email) = 'service3@integratebd.com';
