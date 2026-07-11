-- Ensure all Super Admin popup fields exist in Supabase.
-- Idempotent: safe to re-run. Aligns with MOM / S/I/S / Income / Cash Book / Banking forms.

-- ---------------------------------------------------------------------------
-- Enums used by Cash Book + Banking + Income dropdowns
-- ---------------------------------------------------------------------------
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

do $$ begin
  create type public.user_role as enum ('super_admin', 'admin', 'employee');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- income_per_annum (L.C./Income popup) — created before bank_stat FK
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

alter table public.income_per_annum add column if not exists date date;
alter table public.income_per_annum add column if not exists lc_no text;
alter table public.income_per_annum add column if not exists date_of_issue date;
alter table public.income_per_annum add column if not exists date_of_ship date;
alter table public.income_per_annum add column if not exists date_of_export date;
alter table public.income_per_annum add column if not exists customer text;
alter table public.income_per_annum add column if not exists manufacturer text;
alter table public.income_per_annum add column if not exists amount numeric(14, 2);
alter table public.income_per_annum add column if not exists commission numeric(14, 2);
alter table public.income_per_annum add column if not exists bank public.bank_name;
alter table public.income_per_annum add column if not exists remarks text;
alter table public.income_per_annum add column if not exists created_at timestamptz not null default now();
alter table public.income_per_annum add column if not exists updated_at timestamptz not null default now();
alter table public.income_per_annum add column if not exists created_by uuid references public.users (id) on delete set null;

comment on table public.income_per_annum is 'L.C. / Income Per Annum popup entries';
comment on column public.income_per_annum.bank is 'Dropdown: EBL | Brac Bank | City Bank | AB Bank';

-- ---------------------------------------------------------------------------
-- cash_book (Cash Book popup)
-- Date, Payment Type, Amount, Details, Remarks
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

alter table public.cash_book add column if not exists date date;
alter table public.cash_book add column if not exists payment_type public.payment_type;
alter table public.cash_book add column if not exists amount numeric(14, 2);
alter table public.cash_book add column if not exists details text;
alter table public.cash_book add column if not exists remarks text;
alter table public.cash_book add column if not exists created_at timestamptz not null default now();
alter table public.cash_book add column if not exists updated_at timestamptz not null default now();
alter table public.cash_book add column if not exists created_by uuid references public.users (id) on delete set null;

comment on table public.cash_book is 'Cash Book popup entries';
comment on column public.cash_book.payment_type is 'Dropdown: Cheque | Cash';

-- ---------------------------------------------------------------------------
-- bank_stat (Banking popup)
-- Date, Payment Type, Amount, Bank, Remarks, Received?
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

alter table public.bank_stat add column if not exists date date;
alter table public.bank_stat add column if not exists payment_type public.payment_type;
alter table public.bank_stat add column if not exists amount numeric(14, 2);
alter table public.bank_stat add column if not exists bank_name public.bank_name;
alter table public.bank_stat add column if not exists remarks text;
alter table public.bank_stat add column if not exists received boolean not null default false;
alter table public.bank_stat add column if not exists income_per_annum_id uuid;
alter table public.bank_stat add column if not exists created_at timestamptz not null default now();
alter table public.bank_stat add column if not exists updated_at timestamptz not null default now();
alter table public.bank_stat add column if not exists created_by uuid references public.users (id) on delete set null;

comment on table public.bank_stat is 'Banking / Bank A/C Standings popup entries';
comment on column public.bank_stat.payment_type is 'Dropdown: Cheque | Cash';
comment on column public.bank_stat.bank_name is 'Dropdown: EBL | Brac Bank | City Bank | AB Bank';
comment on column public.bank_stat.received is 'Received? Yes/No';

-- ---------------------------------------------------------------------------
-- mom_report (MOM popup)
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

alter table public.mom_report add column if not exists company_name text;
alter table public.mom_report add column if not exists company_address text;
alter table public.mom_report add column if not exists type_of_machine text;
alter table public.mom_report add column if not exists machine_no text;
alter table public.mom_report add column if not exists type_of_visit text;
alter table public.mom_report add column if not exists starting_date date;
alter table public.mom_report add column if not exists ending_date date;
alter table public.mom_report add column if not exists days_taken text;
alter table public.mom_report add column if not exists technicians_txt text;
alter table public.mom_report add column if not exists technician_user_id uuid;
alter table public.mom_report add column if not exists mom_date date;
alter table public.mom_report add column if not exists note text;
alter table public.mom_report add column if not exists conclusion text;
alter table public.mom_report add column if not exists installation_report text;
alter table public.mom_report add column if not exists machine_warrenty boolean not null default false;
alter table public.mom_report add column if not exists created_at timestamptz not null default now();
alter table public.mom_report add column if not exists updated_at timestamptz not null default now();
alter table public.mom_report add column if not exists created_by uuid references public.users (id) on delete set null;

comment on table public.mom_report is 'MOM Report popup entries';

-- ---------------------------------------------------------------------------
-- s_i_s_report (S/I/S popup)
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

alter table public.s_i_s_report add column if not exists customer_name text;
alter table public.s_i_s_report add column if not exists machine_equipment_name text;
alter table public.s_i_s_report add column if not exists model_no text;
alter table public.s_i_s_report add column if not exists machine_manufacturer text;
alter table public.s_i_s_report add column if not exists date_of_report date;
alter table public.s_i_s_report add column if not exists contact_person text;
alter table public.s_i_s_report add column if not exists phone text;
alter table public.s_i_s_report add column if not exists email text;
alter table public.s_i_s_report add column if not exists location text;
alter table public.s_i_s_report add column if not exists sr_no text;
alter table public.s_i_s_report add column if not exists report_no text;
alter table public.s_i_s_report add column if not exists amc_no text;
alter table public.s_i_s_report add column if not exists visit text;
alter table public.s_i_s_report add column if not exists rh text;
alter table public.s_i_s_report add column if not exists mom_date date;
alter table public.s_i_s_report add column if not exists observation text;
alter table public.s_i_s_report add column if not exists action_taken text;
alter table public.s_i_s_report add column if not exists result_after_action_taken text;
alter table public.s_i_s_report add column if not exists nature_of_complaint text;
alter table public.s_i_s_report add column if not exists next_visit_required text;
alter table public.s_i_s_report add column if not exists spare_parts_required text;
alter table public.s_i_s_report add column if not exists year_of_installation text;
alter table public.s_i_s_report add column if not exists environment_temp text;
alter table public.s_i_s_report add column if not exists after_three_months text;
alter table public.s_i_s_report add column if not exists dept_designation text;
alter table public.s_i_s_report add column if not exists customer_remarks text;
alter table public.s_i_s_report add column if not exists debit_note_dt text;
alter table public.s_i_s_report add column if not exists debit_note_number text;
alter table public.s_i_s_report add column if not exists work_starting_date date;
alter table public.s_i_s_report add column if not exists work_ending_date date;
alter table public.s_i_s_report add column if not exists service_charge numeric(14, 2);
alter table public.s_i_s_report add column if not exists lump_charge numeric(14, 2);
alter table public.s_i_s_report add column if not exists total_charge numeric(14, 2);
alter table public.s_i_s_report add column if not exists under_amc boolean not null default false;
alter table public.s_i_s_report add column if not exists under_warrenty boolean not null default false;
alter table public.s_i_s_report add column if not exists if_changable boolean not null default false;
alter table public.s_i_s_report add column if not exists debit_note_to_be_raised boolean not null default false;
alter table public.s_i_s_report add column if not exists customer_training_provided boolean not null default false;
alter table public.s_i_s_report add column if not exists service_type public.service_type;
alter table public.s_i_s_report add column if not exists created_at timestamptz not null default now();
alter table public.s_i_s_report add column if not exists updated_at timestamptz not null default now();
alter table public.s_i_s_report add column if not exists created_by uuid references public.users (id) on delete set null;

comment on table public.s_i_s_report is 'S/I/S Report popup entries';

-- ---------------------------------------------------------------------------
-- RLS: staff can read/write all popup tables
-- ---------------------------------------------------------------------------
alter table public.cash_book enable row level security;
alter table public.bank_stat enable row level security;
alter table public.income_per_annum enable row level security;
alter table public.mom_report enable row level security;
alter table public.s_i_s_report enable row level security;

drop policy if exists "cash_book_staff_all" on public.cash_book;
create policy "cash_book_staff_all"
  on public.cash_book for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "bank_stat_staff_all" on public.bank_stat;
create policy "bank_stat_staff_all"
  on public.bank_stat for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "income_staff_all" on public.income_per_annum;
create policy "income_staff_all"
  on public.income_per_annum for all
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
