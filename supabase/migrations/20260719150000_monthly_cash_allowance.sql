-- Monthly Cash Allowance budgets + rename Food (Bazar) → Office Expense

update public.cash_book
set expense_category = 'Office Expense'
where expense_category = 'Food (Bazar)';

create table if not exists public.monthly_cash_allowance (
  id uuid primary key default gen_random_uuid(),
  year_month date not null,
  amount numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.users (id) on delete set null,
  constraint monthly_cash_allowance_year_month_unique unique (year_month)
);

create index if not exists monthly_cash_allowance_year_month_idx
  on public.monthly_cash_allowance (year_month);

drop trigger if exists set_updated_at on public.monthly_cash_allowance;
create trigger set_updated_at
  before update on public.monthly_cash_allowance
  for each row
  execute function public.set_updated_at();

alter table public.monthly_cash_allowance enable row level security;

-- Cash Book viewers (super_admin + service2) can read budgets
drop policy if exists "monthly_cash_allowance_select" on public.monthly_cash_allowance;
create policy "monthly_cash_allowance_select"
  on public.monthly_cash_allowance for select
  to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin'
      and exists (
        select 1
        from public.users u
        where u.id = auth.uid()
          and lower(u.email) = 'service2@integratebd.com'
      )
    )
  );

-- Only super_admin can create/update/delete budgets
drop policy if exists "monthly_cash_allowance_insert" on public.monthly_cash_allowance;
create policy "monthly_cash_allowance_insert"
  on public.monthly_cash_allowance for insert
  to authenticated
  with check (public.current_user_role() = 'super_admin');

drop policy if exists "monthly_cash_allowance_update" on public.monthly_cash_allowance;
create policy "monthly_cash_allowance_update"
  on public.monthly_cash_allowance for update
  to authenticated
  using (public.current_user_role() = 'super_admin')
  with check (public.current_user_role() = 'super_admin');

drop policy if exists "monthly_cash_allowance_delete" on public.monthly_cash_allowance;
create policy "monthly_cash_allowance_delete"
  on public.monthly_cash_allowance for delete
  to authenticated
  using (public.current_user_role() = 'super_admin');
