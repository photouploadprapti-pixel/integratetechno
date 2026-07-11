-- Integrate Techno Trade schema
-- Mirrors Bubble data types from the Data Types list:
-- User, Products, Bank Stat, Cash Book, MOM Report, S/I/S Report,
-- Carosol Images, Clients Images, Income Per Annum

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (Bubble option sets)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('super_admin', 'admin', 'employee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_type as enum ('cheque', 'cash');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.bank_name as enum ('ebl', 'brac_bank', 'city_bank', 'ab_bank');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.service_type as enum ('service', 'installation', 'sales_report');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- users (app profile table linked to auth.users)
-- Bubble: User { Name, UserType }
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role public.user_role not null default 'employee',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text,
  company_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- carosol_images (Bubble spelling preserved)
-- ---------------------------------------------------------------------------
create table if not exists public.carosol_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- clients_images
-- ---------------------------------------------------------------------------
create table if not exists public.clients_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  client_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- income_per_annum
-- ---------------------------------------------------------------------------
create table if not exists public.income_per_annum (
  id uuid primary key default gen_random_uuid(),
  date date,
  lc_no text,
  date_of_issue date,
  date_of_ship date,
  date_of_export date,
  customer text,
  manufacturer text,
  amount numeric(14, 2),
  commission numeric(14, 2),
  bank public.bank_name,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists income_per_annum_date_idx on public.income_per_annum (date);

-- ---------------------------------------------------------------------------
-- bank_stat
-- ---------------------------------------------------------------------------
create table if not exists public.bank_stat (
  id uuid primary key default gen_random_uuid(),
  date date,
  payment_type public.payment_type,
  amount numeric(14, 2),
  bank_name public.bank_name,
  remarks text,
  received boolean not null default false,
  income_per_annum_id uuid references public.income_per_annum (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists bank_stat_date_idx on public.bank_stat (date);

-- ---------------------------------------------------------------------------
-- cash_book
-- ---------------------------------------------------------------------------
create table if not exists public.cash_book (
  id uuid primary key default gen_random_uuid(),
  date date,
  payment_type public.payment_type,
  amount numeric(14, 2),
  details text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists cash_book_date_idx on public.cash_book (date);

-- ---------------------------------------------------------------------------
-- mom_report
-- ---------------------------------------------------------------------------
create table if not exists public.mom_report (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  company_address text,
  type_of_machine text,
  machine_no text,
  type_of_visit text,
  starting_date date,
  ending_date date,
  days_taken text,
  technicians_txt text,
  technician_user_id uuid references public.users (id) on delete set null,
  mom_date date,
  note text,
  conclusion text,
  installation_report text,
  machine_warrenty boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists mom_report_company_idx on public.mom_report (company_name);

-- ---------------------------------------------------------------------------
-- s_i_s_report
-- ---------------------------------------------------------------------------
create table if not exists public.s_i_s_report (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  machine_equipment_name text,
  model_no text,
  machine_manufacturer text,
  date_of_report date,
  contact_person text,
  phone text,
  email text,
  location text,
  sr_no text,
  report_no text,
  amc_no text,
  visit text,
  rh text,
  mom_date date,
  observation text,
  action_taken text,
  result_after_action_taken text,
  nature_of_complaint text,
  next_visit_required text,
  spare_parts_required text,
  year_of_installation text,
  environment_temp text,
  after_three_months text,
  dept_designation text,
  customer_remarks text,
  debit_note_dt text,
  debit_note_number text,
  work_starting_date date,
  work_ending_date date,
  service_charge numeric(14, 2),
  lump_charge numeric(14, 2),
  total_charge numeric(14, 2),
  under_amc boolean not null default false,
  under_warrenty boolean not null default false,
  if_changable boolean not null default false,
  debit_note_to_be_raised boolean not null default false,
  customer_training_provided boolean not null default false,
  service_type public.service_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null
);

create index if not exists s_i_s_report_customer_idx on public.s_i_s_report (customer_name);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'users',
    'products',
    'carosol_images',
    'clients_images',
    'income_per_annum',
    'bank_stat',
    'cash_book',
    'mom_report',
    's_i_s_report'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Auth sync: create/update public.users when auth.users changes
-- ---------------------------------------------------------------------------
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role public.user_role := 'employee';
  resolved_name text;
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

  insert into public.users (id, email, name, role)
  values (new.id, new.email, resolved_name, resolved_role)
  on conflict (id) do update
    set email = excluded.email,
        name = coalesce(excluded.name, public.users.name),
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_auth_user_created();

-- Backfill existing auth users into public.users
insert into public.users (id, email, name, role)
select
  u.id,
  u.email,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(u.email, 'user'), '@', 1)
  ),
  case
    when coalesce(u.raw_app_meta_data ->> 'role', u.raw_user_meta_data ->> 'role') = 'super_admin' then 'super_admin'::public.user_role
    when coalesce(u.raw_app_meta_data ->> 'role', u.raw_user_meta_data ->> 'role') = 'admin' then 'admin'::public.user_role
    else 'employee'::public.user_role
  end
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      name = coalesce(excluded.name, public.users.name),
      role = excluded.role,
      updated_at = now();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.carosol_images enable row level security;
alter table public.clients_images enable row level security;
alter table public.income_per_annum enable row level security;
alter table public.bank_stat enable row level security;
alter table public.cash_book enable row level security;
alter table public.mom_report enable row level security;
alter table public.s_i_s_report enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_staff()
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
      and role in ('super_admin', 'admin', 'employee')
  );
$$;

-- users policies
drop policy if exists "users_select_own_or_staff" on public.users;
create policy "users_select_own_or_staff"
  on public.users for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists "users_update_own_or_super_admin" on public.users;
create policy "users_update_own_or_super_admin"
  on public.users for update
  to authenticated
  using (id = auth.uid() or public.current_user_role() = 'super_admin')
  with check (id = auth.uid() or public.current_user_role() = 'super_admin');

-- Public website read for marketing tables
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "carosol_public_read" on public.carosol_images;
create policy "carosol_public_read"
  on public.carosol_images for select
  to anon, authenticated
  using (true);

drop policy if exists "clients_images_public_read" on public.clients_images;
create policy "clients_images_public_read"
  on public.clients_images for select
  to anon, authenticated
  using (true);

-- Staff write access for marketing tables
drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write"
  on public.products for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "carosol_staff_write" on public.carosol_images;
create policy "carosol_staff_write"
  on public.carosol_images for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "clients_images_staff_write" on public.clients_images;
create policy "clients_images_staff_write"
  on public.clients_images for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Internal business tables: authenticated staff only
drop policy if exists "income_staff_all" on public.income_per_annum;
create policy "income_staff_all"
  on public.income_per_annum for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "bank_stat_staff_all" on public.bank_stat;
create policy "bank_stat_staff_all"
  on public.bank_stat for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "cash_book_staff_all" on public.cash_book;
create policy "cash_book_staff_all"
  on public.cash_book for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "mom_report_staff_all" on public.mom_report;
create policy "mom_report_staff_all"
  on public.mom_report for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "sis_report_staff_all" on public.s_i_s_report;
create policy "sis_report_staff_all"
  on public.s_i_s_report for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
